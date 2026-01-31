import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { StreakProgressJob } from '../queue.service';
import { StreakProgressUpdateService } from '../../rewards/streak-progress-update.service';
import { SSEService } from '../../sse/sse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetryQueue } from '../../common/entities/retry-queue.entity';

@Processor('streak-progress')
@Injectable()
export class StreakProgressProcessor extends WorkerHost {
  private readonly logger = new Logger(StreakProgressProcessor.name);

  constructor(
    private readonly streakProgressUpdateService: StreakProgressUpdateService,
    private readonly sseService: SSEService,
    @InjectRepository(RetryQueue)
    private retryQueueRepository: Repository<RetryQueue>,
  ) {
    super();
  }

  async process(job: Job<StreakProgressJob>) {
    const { streakProgressId, date, vaccinatorId } = job.data;

    try {
      this.logger.log(`Processing streak progress for vaccinator ${vaccinatorId}, streak progress ${streakProgressId}`);

      const activityDate = new Date(date);

      // Update streak progress atomically in transaction
      // This will:
      // 1. Check if streak is alive (last achieved date is yesterday)
      // 2. Update current streak value or create new streak if broken
      // 3. Calculate rewards based on updated streak progress
      // 4. Award badges/certificates if conditions match
      // 5. Update vaccinator summary
      const result = await this.streakProgressUpdateService.updateStreakProgress({
        streakProgressId,
        date: activityDate,
      });

      this.logger.log(
        `Successfully processed streak progress for vaccinator ${vaccinatorId}, isNewStreak: ${result.isNewStreak}`,
      );

      const response = {
        success: true,
        vaccinatorId,
        streakProgressId: result.streakProgress.id,
        currentStreakValue: result.streakProgress.currentStreakValue,
        isNewStreak: result.isNewStreak,
        rewards: result.rewards,
      };

      // Send result via SSE
      this.sseService.sendEvent(vaccinatorId, 'streak_progress_result', response);

      return response;
    } catch (error) {
      this.logger.error(`Failed to process streak progress: ${error.message}`, error.stack);

      // Save to retry queue
      await this.saveToRetryQueue(job.data, error);

      throw error;
    }
  }

  private async saveToRetryQueue(payload: StreakProgressJob, error: Error) {
    try {
      const retryQueue = this.retryQueueRepository.create({
        queueName: 'streak-progress',
        payload,
        status: 'failed',
        error: error.message,
        retryCount: 0,
        maxRetries: 3,
      });

      await this.retryQueueRepository.save(retryQueue);
      this.logger.log(`Saved failed job to retry queue: ${retryQueue.id}`);
    } catch (saveError) {
      this.logger.error(`Failed to save to retry queue: ${saveError.message}`);
    }
  }
}


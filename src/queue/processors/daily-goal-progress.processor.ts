import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DailyGoalProgressJob } from '../queue.service';
import { DailyGoalProgressUpdateService } from '../../rewards/daily-goal-progress-update.service';
import { SSEService } from '../../sse/sse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetryQueue } from '../../common/entities/retry-queue.entity';

@Processor('daily-goal-progress')
@Injectable()
export class DailyGoalProgressProcessor extends WorkerHost {
  private readonly logger = new Logger(DailyGoalProgressProcessor.name);

  constructor(
    private readonly dailyGoalProgressUpdateService: DailyGoalProgressUpdateService,
    private readonly sseService: SSEService,
    @InjectRepository(RetryQueue)
    private retryQueueRepository: Repository<RetryQueue>,
  ) {
    super();
  }

  async process(job: Job<DailyGoalProgressJob>) {
    const { dailyGoalProgressId, userValue, vaccinatorId } = job.data;

    try {
      this.logger.log(
        `Processing daily goal progress for vaccinator ${vaccinatorId}, daily goal progress ${dailyGoalProgressId}, user value ${userValue}`,
      );

      // Update daily goal progress atomically in transaction
      // This will:
      // 1. Update current goal value with user value
      // 2. Check if goal is achieved (current >= threshold)
      // 3. Calculate rewards based on updated daily goal progress
      // 4. Award badges/certificates if conditions match
      // 5. Update vaccinator summary
      const result = await this.dailyGoalProgressUpdateService.updateDailyGoalProgress({
        dailyGoalProgressId,
        userValue,
      });

      this.logger.log(
        `Successfully processed daily goal progress for vaccinator ${vaccinatorId}, wasJustAchieved: ${result.wasJustAchieved}`,
      );

      const response = {
        success: true,
        vaccinatorId,
        dailyGoalProgressId: result.dailyGoalProgress.id,
        currentGoalValue: result.dailyGoalProgress.currentGoalValue,
        goalValue: result.dailyGoalProgress.goalValue,
        isAchieved: result.dailyGoalProgress.isAchieved,
        wasJustAchieved: result.wasJustAchieved,
        rewards: result.rewards,
      };

      // Send result via SSE
      this.sseService.sendEvent(vaccinatorId, 'daily_goal_progress_result', response);

      return response;
    } catch (error) {
      this.logger.error(`Failed to process daily goal progress: ${error.message}`, error.stack);

      // Save to retry queue
      await this.saveToRetryQueue(job.data, error);

      throw error;
    }
  }

  private async saveToRetryQueue(payload: DailyGoalProgressJob, error: Error) {
    try {
      const retryQueue = this.retryQueueRepository.create({
        queueName: 'daily-goal-progress',
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


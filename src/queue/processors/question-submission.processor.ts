import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { QuestionSubmissionJob } from '../queue.service';
import { RewardCalculationService } from '../../rewards/reward-calculation.service';
import { ProgressUpdateService } from '../../rewards/progress-update.service';
import { SSEService } from '../../sse/sse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetryQueue } from '../../common/entities/retry-queue.entity';

@Processor('question-submission')
@Injectable()
export class QuestionSubmissionProcessor extends WorkerHost {
  private readonly logger = new Logger(QuestionSubmissionProcessor.name);

  constructor(
    private readonly rewardCalculationService: RewardCalculationService,
    private readonly progressUpdateService: ProgressUpdateService,
    private readonly sseService: SSEService,
    @InjectRepository(RetryQueue)
    private retryQueueRepository: Repository<RetryQueue>,
  ) {
    super();
  }

  async process(job: Job<QuestionSubmissionJob>) {
    const { lessonQuestionId, vaccinatorId, answer, questionId, questionXp, isCorrect, timestamp } = job.data;

    try {
      this.logger.log(`Processing question submission for vaccinator ${vaccinatorId}, question ${questionId}`);

      // Update progress tables atomically in transaction
      // This will:
      // 1. Update all progress tables with question XP
      // 2. Calculate rewards based on updated progress
      // 3. Update progress tables again with reward XP
      // 4. Update vaccinator summary
      await this.progressUpdateService.updateProgress({
        lessonQuestionId,
        vaccinatorId,
        questionXp,
        isCorrect,
        timestamp,
      });

      this.logger.log(`Successfully processed question submission for vaccinator ${vaccinatorId}`);

      const result = {
        success: true,
        vaccinatorId,
        lessonQuestionId,
        questionXp,
        isCorrect,
      };

      // Send result via SSE
      this.sseService.sendEvent(vaccinatorId, 'question_submission_result', result);

      return result;
    } catch (error) {
      this.logger.error(`Failed to process question submission: ${error.message}`, error.stack);

      // Save to retry queue
      await this.saveToRetryQueue(job.data, error);

      throw error;
    }
  }

  private async saveToRetryQueue(payload: QuestionSubmissionJob, error: Error) {
    try {
      const retryQueue = this.retryQueueRepository.create({
        queueName: 'question-submission',
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


import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QuestionSubmissionProcessor } from './processors/question-submission.processor';
import { StreakProgressProcessor } from './processors/streak-progress.processor';
import { DailyGoalProgressProcessor } from './processors/daily-goal-progress.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetryQueue } from '../common/entities/retry-queue.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { SSEModule } from '../sse/sse.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'question-submission',
    }),
    BullModule.registerQueue({
      name: 'streak-progress',
    }),
    BullModule.registerQueue({
      name: 'daily-goal-progress',
    }),
    TypeOrmModule.forFeature([RetryQueue]),
    RewardsModule,
    SSEModule,
  ],
  providers: [QueueService, QuestionSubmissionProcessor, StreakProgressProcessor, DailyGoalProgressProcessor],
  exports: [QueueService],
})
export class QueueModule {}


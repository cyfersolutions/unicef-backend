import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyGoalsService } from './daily-goals.service';
import { DailyGoalsController } from './daily-goals.controller';
import { DailyGoal } from './entities/daily-goal.entity';
import { DailyGoalProgress } from './entities/daily-goal-progress.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyGoal, DailyGoalProgress, Vaccinator]),
    QueueModule,
  ],
  controllers: [DailyGoalsController],
  providers: [DailyGoalsService],
  exports: [DailyGoalsService],
})
export class DailyGoalsModule {}

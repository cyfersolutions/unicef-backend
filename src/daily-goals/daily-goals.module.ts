import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyGoalsService } from './daily-goals.service';
import { DailyGoalsController } from './daily-goals.controller';
import { DailyGoal } from './entities/daily-goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyGoal])],
  controllers: [DailyGoalsController],
  providers: [DailyGoalsService],
  exports: [DailyGoalsService],
})
export class DailyGoalsModule {}

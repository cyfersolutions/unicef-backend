import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardCalculationService } from './reward-calculation.service';
import { ProgressUpdateService } from './progress-update.service';
import { StreakProgressUpdateService } from './streak-progress-update.service';
import { DailyGoalProgressUpdateService } from './daily-goal-progress-update.service';
import { RewardRule } from '../reward-rules/entities/reward-rule.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Unit } from '../units/entities/unit.entity';
import { Module as ModuleEntity } from '../modules/entities/module.entity';
import { LessonQuestionProgress } from '../lessons/entities/lesson-question-progress.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { ModuleProgress } from '../modules/entities/module-progress.entity';
import { VaccinatorSummary } from '../users/entities/vaccinator-summary.entity';
import { VaccinatorBadge } from '../badges/entities/vaccinator-badge.entity';
import { VaccinatorCertificate } from '../certificates/entities/vaccinator-certificate.entity';
import { StreakProgress } from '../streaks/entities/streak-progress.entity';
import { DailyGoalProgress } from '../daily-goals/entities/daily-goal-progress.entity';
import { WrongQuestion } from '../questions/entities/wrong-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardRule,
      LessonQuestion,
      Lesson,
      Unit,
      ModuleEntity,
      LessonQuestionProgress,
      LessonProgress,
      UnitProgress,
      ModuleProgress,
      VaccinatorSummary,
      VaccinatorBadge,
      VaccinatorCertificate,
      StreakProgress,
      DailyGoalProgress,
      WrongQuestion,
    ]),
  ],
  providers: [
    RewardCalculationService,
    ProgressUpdateService,
    StreakProgressUpdateService,
    DailyGoalProgressUpdateService,
  ],
  exports: [
    RewardCalculationService,
    ProgressUpdateService,
    StreakProgressUpdateService,
    DailyGoalProgressUpdateService,
  ],
})
export class RewardsModule {}


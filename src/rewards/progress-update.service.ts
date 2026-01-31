import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LessonQuestionProgress } from '../lessons/entities/lesson-question-progress.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { ModuleProgress } from '../modules/entities/module-progress.entity';
import { VaccinatorSummary } from '../users/entities/vaccinator-summary.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { WrongQuestion } from '../questions/entities/wrong-question.entity';
import { RewardCalculationService, CalculatedRewards } from './reward-calculation.service';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Unit } from 'src/units/entities/unit.entity';

export interface UpdateProgressInput {
  lessonQuestionId: string;
  vaccinatorId: string;
  questionXp: number;
  isCorrect: boolean;
  timestamp: Date;
}

@Injectable()
export class ProgressUpdateService {
  constructor(
    @InjectRepository(LessonQuestionProgress)
    private lessonQuestionProgressRepository: Repository<LessonQuestionProgress>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(UnitProgress)
    private unitProgressRepository: Repository<UnitProgress>,
    @InjectRepository(ModuleProgress)
    private moduleProgressRepository: Repository<ModuleProgress>,
    @InjectRepository(VaccinatorSummary)
    private vaccinatorSummaryRepository: Repository<VaccinatorSummary>,
    @InjectRepository(LessonQuestion)
    private lessonQuestionRepository: Repository<LessonQuestion>,
    private dataSource: DataSource,
    private rewardCalculationService: RewardCalculationService,
  ) {}

  async updateProgress(input: UpdateProgressInput): Promise<void> {
    const { lessonQuestionId, vaccinatorId, questionXp, isCorrect, timestamp } = input;

    // Use transaction for atomic updates
    await this.dataSource.transaction(async (manager) => {
      // Get lesson question with relations
      const lessonQuestion = await manager.findOne(LessonQuestion, {
        where: { id: lessonQuestionId },
        relations: ['lesson', 'lesson.unit', 'lesson.unit.module'],
      });

      if (!lessonQuestion) {
        throw new Error(`Lesson question ${lessonQuestionId} not found`);
      }

      const lesson = lessonQuestion.lesson;
      const unit = lesson.unit;
      const module = unit.module;

      // 1. Update or create lesson_question_progress
      let lessonQuestionProgress = await manager.findOne(LessonQuestionProgress, {
        where: {
          lessonQuestionId,
          vaccinatorId,
          attemptNumber: 1, // You may want to calculate this based on existing attempts
        },
      });

      if (!lessonQuestionProgress) {
        lessonQuestionProgress = manager.create(LessonQuestionProgress, {
          lessonQuestionId,
          vaccinatorId,
          attemptNumber: 1,
          isCompleted: isCorrect,
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
          endDatetime: timestamp,
        });
      } else {
        lessonQuestionProgress.isCompleted = isCorrect || lessonQuestionProgress.isCompleted;
        lessonQuestionProgress.xpEarned += questionXp; // Add question XP first
        lessonQuestionProgress.endDatetime = timestamp;
      }

      await manager.save(lessonQuestionProgress);

      // 1.5. Record wrong question if answer is incorrect
      if (!isCorrect) {
        const wrongQuestion = manager.create(WrongQuestion, {
          lessonQuestionId,
          vaccinatorId,
          answeredAt: timestamp,
        });
        await manager.save(wrongQuestion);
      }

      // 2. Update or create lesson_progress
      let lessonProgress = await manager.findOne(LessonProgress, {
        where: {
          lessonId: lesson.id,
          vaccinatorId,
          attemptNumber: 1,
        },
      });

      const wasLessonCompletedBefore = lessonProgress?.isCompleted ?? false;
      const previousQuestionsCompleted = lessonProgress?.questionsCompleted ?? 0;

      if (!lessonProgress) {
        lessonProgress = manager.create(LessonProgress, {
          lessonId: lesson.id,
          vaccinatorId,
          attemptNumber: 1,
          questionsCompleted: isCorrect ? 1 : 0,
          currentQuestionId: lessonQuestionId,
          masteryLevel: isCorrect ? 100 : 0,
          isCompleted: false,
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
        });
      } else {
        if (isCorrect) {
          lessonProgress.questionsCompleted += 1;
        }
        lessonProgress.xpEarned += questionXp; // Add question XP first
        lessonProgress.currentQuestionId = lessonQuestionId;

        // Calculate mastery level
        const totalQuestions = await manager.count(LessonQuestion, {
          where: { lessonId: lesson.id },
        });
        lessonProgress.masteryLevel = totalQuestions > 0 
          ? (lessonProgress.questionsCompleted / totalQuestions) * 100 
          : 0;

        // Check if lesson is completed
        if (lessonProgress.questionsCompleted >= totalQuestions) {
          lessonProgress.isCompleted = true;
          lessonProgress.endDatetime = timestamp;
        }
      }

      await manager.save(lessonProgress);
      
      // Check if lesson was just completed in this transaction
      const isLessonNewlyCompleted = lessonProgress.isCompleted && !wasLessonCompletedBefore;

      // 3. Update or create unit_progress
      let unitProgress = await manager.findOne(UnitProgress, {
        where: {
          unitId: unit.id,
          vaccinatorId,
          attemptNumber: 1,
        },
      });

      const wasUnitCompletedBefore = unitProgress?.isCompleted || false;

      if (!unitProgress) {
        unitProgress = manager.create(UnitProgress, {
          unitId: unit.id,
          vaccinatorId,
          attemptNumber: 1,
          lessonsCompleted: isLessonNewlyCompleted ? 1 : 0,
          currentLessonId: lesson.id,
          masteryLevel: isLessonNewlyCompleted ? 100 : 0,
          isCompleted: false,
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
        });
      } else {
        if (isLessonNewlyCompleted) {
          unitProgress.lessonsCompleted += 1;
        }
        unitProgress.xpEarned += questionXp; // Add question XP first
        unitProgress.currentLessonId = lesson.id;

        // Calculate mastery level
        const totalLessons = await manager.count(Lesson, {
          where: { unitId: unit.id },
        });
        unitProgress.masteryLevel = totalLessons > 0 
          ? (unitProgress.lessonsCompleted / totalLessons) * 100 
          : 0;

        // Check if unit is completed
        if (unitProgress.lessonsCompleted >= totalLessons) {
          unitProgress.isCompleted = true;
          unitProgress.endDatetime = timestamp;
        }
      }

      await manager.save(unitProgress);
      const isUnitNewlyCompleted = unitProgress.isCompleted && !wasUnitCompletedBefore;

      // 4. Update or create module_progress
      let moduleProgress = await manager.findOne(ModuleProgress, {
        where: {
          moduleId: module.id,
          vaccinatorId,
          attemptNumber: 1,
        },
      });

      const wasModuleCompletedBefore = moduleProgress?.isCompleted || false;

      if (!moduleProgress) {
        moduleProgress = manager.create(ModuleProgress, {
          moduleId: module.id,
          vaccinatorId,
          attemptNumber: 1,
          unitsCompleted: isUnitNewlyCompleted ? 1 : 0,
          currentUnitId: unit.id,
          masteryLevel: isUnitNewlyCompleted ? 100 : 0,
          isCompleted: false,
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
        });
      } else {
        if (isUnitNewlyCompleted) {
          moduleProgress.unitsCompleted += 1;
        }
        moduleProgress.xpEarned += questionXp; // Add question XP first
        moduleProgress.currentUnitId = unit.id;

        // Calculate mastery level
        const totalUnits = await manager.count(Unit, {
          where: { moduleId: module.id },
        });
        moduleProgress.masteryLevel = totalUnits > 0 
          ? (moduleProgress.unitsCompleted / totalUnits) * 100 
          : 0;

        // Check if module is completed
        if (moduleProgress.unitsCompleted >= totalUnits) {
          moduleProgress.isCompleted = true;
          moduleProgress.endDatetime = timestamp;
        }
      }

      await manager.save(moduleProgress);

      // Step 2: Calculate rewards based on updated progress
      const rewards = await this.rewardCalculationService.calculateRewards({
        lessonQuestionId,
        vaccinatorId,
        questionXp,
        lessonProgress,
        unitProgress,
        moduleProgress,
        lessonId: lesson.id,
        unitId: unit.id,
        moduleId: module.id,
        transactionManager: manager, // Pass transaction manager for atomic badge/certificate creation
      });

      // Step 3: Update progress tables again with reward XP
      if (rewards.xp > 0) {
        lessonQuestionProgress.xpEarned += rewards.xp;
        await manager.save(lessonQuestionProgress);

        lessonProgress.xpEarned += rewards.xp;
        await manager.save(lessonProgress);

        unitProgress.xpEarned += rewards.xp;
        await manager.save(unitProgress);

        moduleProgress.xpEarned += rewards.xp;
        await manager.save(moduleProgress);
      }

      // Step 4: Update vaccinator_summary
      let vaccinatorSummary = await manager.findOne(VaccinatorSummary, {
        where: { vaccinatorId },
      });
      if (!vaccinatorSummary) {
        vaccinatorSummary = manager.create(VaccinatorSummary, {
          vaccinatorId,
          totalXp: questionXp + rewards.xp,
          totalBadges: rewards.badges.length,
          totalCertificates: rewards.certificates.length,
          modulesCompleted: moduleProgress.isCompleted ? 1 : 0,
          unitsCompleted: unitProgress.isCompleted ? 1 : 0,
          lessonsCompleted: lessonProgress.isCompleted ? 1 : 0,
          questionsAnswered: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          overallAccuracy: isCorrect ? 100 : 0,
        });
      } else {
        vaccinatorSummary.totalXp += questionXp + rewards.xp;
        vaccinatorSummary.totalBadges += rewards.badges.length;
        vaccinatorSummary.totalCertificates += rewards.certificates.length;
        vaccinatorSummary.questionsAnswered += 1;
        if (isCorrect) {
          vaccinatorSummary.questionsCorrect += 1;
        }
        vaccinatorSummary.overallAccuracy =
          (vaccinatorSummary.questionsCorrect / vaccinatorSummary.questionsAnswered) * 100;

        // Update completion counts only if newly completed
        if (isLessonNewlyCompleted) {
          vaccinatorSummary.lessonsCompleted += 1;
        }
        if (isUnitNewlyCompleted) {
          vaccinatorSummary.unitsCompleted += 1;
        }
        const isModuleNewlyCompleted = moduleProgress.isCompleted && !wasModuleCompletedBefore;
        if (isModuleNewlyCompleted) {
          vaccinatorSummary.modulesCompleted += 1;
        }
      }

      await manager.save(vaccinatorSummary);
    });
  }
}


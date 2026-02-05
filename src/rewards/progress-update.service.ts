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
import { UnitGame } from '../games/entities/unit-game.entity';
import { VaccinatorUnitGameProgress } from '../games/entities/vaccinator-unit-game-progress.entity';

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
          attemptNumber: 1,
        },
      });

      if (!lessonQuestionProgress) {
        lessonQuestionProgress = manager.create(LessonQuestionProgress, {
          lessonQuestionId,
          vaccinatorId,
          attemptNumber: 1,
          isCompleted: true,
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
          endDatetime: timestamp,
        });
      } else {
        // lessonQuestionProgress.isCompleted = isCorrect || lessonQuestionProgress.isCompleted;
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
      
      // Get total questions count
      const totalQuestions = await manager.count(LessonQuestion, {
        where: { lessonId: lesson.id },
      });

      if (!lessonProgress) {
        // First question submission for this lesson
        lessonProgress = manager.create(LessonProgress, {
          lessonId: lesson.id,
          vaccinatorId,
          attemptNumber: 1,
          questionsCompleted: 1, // First question submitted
          currentQuestionId: lessonQuestionId,
          masteryLevel: totalQuestions > 0 ? (1 / totalQuestions) * 100 : 0,
          isCompleted: totalQuestions === 1, // Completed only if this is the only question
          xpEarned: questionXp, // Initial XP without rewards
          startDatetime: timestamp,
          endDatetime: totalQuestions === 1 ? timestamp : null,
        });
      } else {
        // Always increment questionsCompleted every time a question is submitted
        lessonProgress.questionsCompleted += 1;
        lessonProgress.xpEarned += questionXp; // Add question XP first
        lessonProgress.currentQuestionId = lessonQuestionId;

        // Calculate mastery level based on questions completed
        lessonProgress.masteryLevel = totalQuestions > 0 
          ? (lessonProgress.questionsCompleted / totalQuestions) * 100 
          : 0;

        // Check if lesson is completed (all questions attempted)
        if (lessonProgress.questionsCompleted >= totalQuestions) {
          lessonProgress.isCompleted = true;
          lessonProgress.endDatetime = timestamp;
        }
      }

      await manager.save(lessonProgress);
      
      // Check if lesson was just completed in this transaction
      const isLessonNewlyCompleted = lessonProgress.isCompleted && !wasLessonCompletedBefore;

      // If lesson was just completed, check if there are unit games for this lesson
      // If there are games, don't unlock next lesson until games are completed
      let nextLessonId: string | null = null;
      if (isLessonNewlyCompleted) {
        // Check if there are any unit games associated with this lesson
        const lessonUnitGames = await manager.find(UnitGame, {
          where: { lessonId: lesson.id },
        });

        // Only unlock next lesson if there are no games for this lesson
        if (lessonUnitGames.length === 0) {
          // Get all lessons in the unit ordered by orderNo
          const unitLessons = await manager.find(Lesson, {
            where: { unitId: unit.id },
            order: { orderNo: 'ASC' },
          });

          // Find current lesson index
          const currentLessonIndex = unitLessons.findIndex((l) => l.id === lesson.id);
          
          // If there's a next lesson, create progress for it
          if (currentLessonIndex >= 0 && currentLessonIndex < unitLessons.length - 1) {
            const nextLesson = unitLessons[currentLessonIndex + 1];
            nextLessonId = nextLesson.id;
            
            // Check if progress already exists for next lesson
            const nextLessonProgress = await manager.findOne(LessonProgress, {
              where: {
                lessonId: nextLesson.id,
                vaccinatorId,
                attemptNumber: 1,
              },
            });

            // Create progress for next lesson if it doesn't exist
            if (!nextLessonProgress) {
              const newLessonProgress = manager.create(LessonProgress, {
                lessonId: nextLesson.id,
                vaccinatorId,
                attemptNumber: 1,
                questionsCompleted: 0,
                currentQuestionId: null,
                masteryLevel: 0,
                isCompleted: false,
                xpEarned: 0,
                startDatetime: timestamp,
              });
              await manager.save(newLessonProgress);
            }
          }
        }
      }

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
          // Update currentLessonId to next lesson if lesson was completed
          if (nextLessonId) {
            unitProgress.currentLessonId = nextLessonId;
          }
        } else {
          unitProgress.currentLessonId = lesson.id;
        }
        unitProgress.xpEarned += questionXp; // Add question XP first

        // Calculate mastery level
        const totalLessons = await manager.count(Lesson, {
          where: { unitId: unit.id },
        });
        unitProgress.masteryLevel = totalLessons > 0 
          ? (unitProgress.lessonsCompleted / totalLessons) * 100 
          : 0;

        // Check if all lessons are completed
        const allLessonsCompleted = unitProgress.lessonsCompleted >= totalLessons;

        // Check if all unit games are completed (if any exist)
        const unitGames = await manager.find(UnitGame, {
          where: { unitId: unit.id },
        });

        let allGamesCompleted = true;
        if (unitGames.length > 0) {
          // Check if all unit games have completed progress for this vaccinator
          for (const unitGame of unitGames) {
            const gameProgress = await manager.findOne(VaccinatorUnitGameProgress, {
              where: {
                unitGameId: unitGame.id,
                vaccinatorId,
                isCompleted: true,
              },
            });
            if (!gameProgress) {
              allGamesCompleted = false;
              break;
            }
          }
        }

        // Unit is completed only if all lessons AND all games are completed
        if (allLessonsCompleted && allGamesCompleted) {
          unitProgress.isCompleted = true;
          unitProgress.endDatetime = timestamp;
        }
      }

      await manager.save(unitProgress);
      const isUnitNewlyCompleted = unitProgress.isCompleted && !wasUnitCompletedBefore;

      // If unit was just completed, create progress for next unit in module
      if (isUnitNewlyCompleted) {
        // Get all units in the module ordered by orderNo
        const moduleUnits = await manager.find(Unit, {
          where: { moduleId: module.id },
          order: { orderNo: 'ASC' },
        });

        // Find current unit index
        const currentUnitIndex = moduleUnits.findIndex((u) => u.id === unit.id);
        
        // If there's a next unit, create progress for it and its first lesson
        if (currentUnitIndex >= 0 && currentUnitIndex < moduleUnits.length - 1) {
          const nextUnit = moduleUnits[currentUnitIndex + 1];
          
          // Check if unit progress already exists for next unit
          const nextUnitProgress = await manager.findOne(UnitProgress, {
            where: {
              unitId: nextUnit.id,
              vaccinatorId,
              attemptNumber: 1,
            },
          });

          // Create unit progress for next unit if it doesn't exist
          if (!nextUnitProgress) {
            const newUnitProgress = manager.create(UnitProgress, {
              unitId: nextUnit.id,
              vaccinatorId,
              attemptNumber: 1,
              lessonsCompleted: 0,
              currentLessonId: null,
              masteryLevel: 0,
              isCompleted: false,
              xpEarned: 0,
              startDatetime: timestamp,
            });
            await manager.save(newUnitProgress);

            // Get first lesson of the next unit
            const firstLesson = await manager.findOne(Lesson, {
              where: { unitId: nextUnit.id },
              order: { orderNo: 'ASC' },
            });

            // Create lesson progress for first lesson if it exists
            if (firstLesson) {
              // Check if lesson progress already exists
              const firstLessonProgress = await manager.findOne(LessonProgress, {
                where: {
                  lessonId: firstLesson.id,
                  vaccinatorId,
                  attemptNumber: 1,
                },
              });

              // Create lesson progress for first lesson if it doesn't exist
              if (!firstLessonProgress) {
                const newLessonProgress = manager.create(LessonProgress, {
                  lessonId: firstLesson.id,
                  vaccinatorId,
                  attemptNumber: 1,
                  questionsCompleted: 0,
                  currentQuestionId: null,
                  masteryLevel: 0,
                  isCompleted: false,
                  xpEarned: 0,
                  startDatetime: timestamp,
                });
                await manager.save(newLessonProgress);

                // Update unit progress to point to first lesson
                newUnitProgress.currentLessonId = firstLesson.id;
                await manager.save(newUnitProgress);
              }
            }
          }
        }
      }

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


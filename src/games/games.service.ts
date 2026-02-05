import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VaccinatorUnitGameProgress } from './entities/vaccinator-unit-game-progress.entity';
import { UnitGame } from './entities/unit-game.entity';
import { Game } from './entities/game.entity';
import { Unit } from '../units/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { ModuleProgress } from '../modules/entities/module-progress.entity';
import { SubmitGameProgressDto } from './dto/submit-game-progress.dto';
import { SubmitGameCompletionDto } from './dto/submit-game-completion.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { AssignGameToUnitLessonDto } from './dto/assign-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(UnitGame)
    private unitGameRepository: Repository<UnitGame>,
    @InjectRepository(VaccinatorUnitGameProgress)
    private vaccinatorUnitGameProgressRepository: Repository<VaccinatorUnitGameProgress>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Vaccinator)
    private vaccinatorRepository: Repository<Vaccinator>,
    @InjectRepository(UnitProgress)
    private unitProgressRepository: Repository<UnitProgress>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(ModuleProgress)
    private moduleProgressRepository: Repository<ModuleProgress>,
    private dataSource: DataSource,
  ) {}

  async submitGameProgress(dto: SubmitGameProgressDto) {
    // Validate unit game exists
    const unitGame = await this.unitGameRepository.findOne({
      where: { id: dto.unitGameId },
      relations: ['game', 'unit', 'lesson'],
    });

    if (!unitGame) {
      throw new NotFoundException(`Unit game with ID ${dto.unitGameId} not found`);
    }

    // Validate vaccinator exists
    const vaccinator = await this.vaccinatorRepository.findOne({
      where: { id: dto.vaccinatorId },
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${dto.vaccinatorId} not found`);
    }

    // Check if score meets passing score
    const isPassed = dto.isPassed && dto.score >= unitGame.passingScore;

    // Calculate XP earned (you can customize this logic)
    const xpEarned = this.calculateXpEarned(dto.score, unitGame.passingScore, isPassed);

    // Check if this attempt already exists
    const existingProgress = await this.vaccinatorUnitGameProgressRepository.findOne({
      where: {
        unitGameId: dto.unitGameId,
        vaccinatorId: dto.vaccinatorId,
        attempt: dto.attempt,
      },
    });

    let gameProgress: VaccinatorUnitGameProgress;

    if (existingProgress) {
      // Update existing progress
      existingProgress.score = dto.score;
      existingProgress.ratings = dto.ratings ?? null;
      existingProgress.otherFields = dto.otherFields ?? null;
      existingProgress.isPassed = isPassed;
      existingProgress.isCompleted = true;
      existingProgress.xpEarned = xpEarned;
      gameProgress = await this.vaccinatorUnitGameProgressRepository.save(existingProgress);
    } else {
      // Create new progress
      gameProgress = this.vaccinatorUnitGameProgressRepository.create({
        unitGameId: dto.unitGameId,
        vaccinatorId: dto.vaccinatorId,
        score: dto.score,
        attempt: dto.attempt,
        ratings: dto.ratings ?? null,
        otherFields: dto.otherFields ?? null,
        isPassed: isPassed,
        isCompleted: true,
        xpEarned: xpEarned,
      });

      gameProgress = await this.vaccinatorUnitGameProgressRepository.save(gameProgress);
    }

    // Load relations for response
    const savedProgress = await this.vaccinatorUnitGameProgressRepository.findOne({
      where: { id: gameProgress.id },
      relations: ['unitGame', 'unitGame.game', 'unitGame.unit', 'vaccinator'],
    });

    return {
      success: true,
      message: 'Game progress saved successfully',
      data: {
        id: savedProgress?.id,
        unitGameId: savedProgress?.unitGameId,
        vaccinatorId: savedProgress?.vaccinatorId,
        score: savedProgress?.score,
        attempt: savedProgress?.attempt,
        ratings: savedProgress?.ratings,
        otherFields: savedProgress?.otherFields,
        isCompleted: savedProgress?.isCompleted,
        isPassed: savedProgress?.isPassed,
        xpEarned: savedProgress?.xpEarned,
        game: {
          id: savedProgress?.unitGame?.game?.id,
          title: savedProgress?.unitGame?.game?.title,
        },
        unit: {
          id: savedProgress?.unitGame?.unit?.id,
        },
        createdAt: savedProgress?.createdAt,
        updatedAt: savedProgress?.updatedAt,
      },
    };
  }

  async createGame(dto: CreateGameDto) {
    const game = this.gameRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      url: dto.url ?? null,
      isActive: dto.isActive ?? true,
    });

    const savedGame = await this.gameRepository.save(game);

    return {
      success: true,
      message: 'Game created successfully',
      data: savedGame,
    };
  }

  async updateGame(id: string, dto: UpdateGameDto) {
    const game = await this.gameRepository.findOne({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Update only provided fields
    if (dto.title !== undefined) game.title = dto.title;
    if (dto.description !== undefined) game.description = dto.description;
    if (dto.url !== undefined) game.url = dto.url;
    if (dto.isActive !== undefined) game.isActive = dto.isActive;

    const updatedGame = await this.gameRepository.save(game);

    return {
      success: true,
      message: 'Game updated successfully',
      data: updatedGame,
    };
  }

  async assignGameToUnitLesson(dto: AssignGameToUnitLessonDto) {
    // Validate game exists
    const game = await this.gameRepository.findOne({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Validate unit exists
    const unit = await this.unitRepository.findOne({
      where: { id: dto.unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${dto.unitId} not found`);
    }

    // Validate lesson exists
    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${dto.lessonId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.unitGameRepository.findOne({
      where: {
        gameId: dto.gameId,
        unitId: dto.unitId,
        lessonId: dto.lessonId,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Game is already assigned to this unit and lesson. Use update endpoint to modify the assignment.`,
      );
    }

    // Create new assignment
    const unitGame = this.unitGameRepository.create({
      gameId: dto.gameId,
      unitId: dto.unitId,
      lessonId: dto.lessonId,
      passingScore: dto.passingScore,
    });

    const savedUnitGame = await this.unitGameRepository.save(unitGame);

    // Load relations for response
    const assignment = await this.unitGameRepository.findOne({
      where: { id: savedUnitGame.id },
      relations: ['game', 'unit', 'lesson'],
    });

    return {
      success: true,
      message: 'Game assigned to unit and lesson successfully',
      data: {
        id: assignment?.id,
        game: {
          id: assignment?.game?.id,
          title: assignment?.game?.title,
          url: assignment?.game?.url,
        },
        unit: {
          id: assignment?.unit?.id,
          title: assignment?.unit?.title,
        },
        lesson: {
          id: assignment?.lesson?.id,
          title: assignment?.lesson?.title,
        },
        passingScore: assignment?.passingScore,
        createdAt: assignment?.createdAt,
        updatedAt: assignment?.updatedAt,
      },
    };
  }

  async submitGameCompletion(dto: SubmitGameCompletionDto, vaccinatorId: string) {
    // Use transaction for atomic updates
    return await this.dataSource.transaction(async (manager) => {
      // Validate unit game exists with module relation
      const unitGame = await manager.findOne(UnitGame, {
        where: { id: dto.unitGameId },
        relations: ['game', 'unit', 'unit.module', 'lesson'],
      });

      if (!unitGame) {
        throw new NotFoundException(`Unit game with ID ${dto.unitGameId} not found`);
      }

      // Validate vaccinator exists
      const vaccinator = await manager.findOne(Vaccinator, {
        where: { id: vaccinatorId },
      });

      if (!vaccinator) {
        throw new NotFoundException(`Vaccinator with ID ${vaccinatorId} not found`);
      }

      const lesson = unitGame.lesson;
      const unit = unitGame.unit;
      const module = unit.module;

      // Check if score meets passing score
      const isPassed = dto.score >= unitGame.passingScore;

      // Calculate XP earned
      const xpEarned = this.calculateXpEarned(dto.score, unitGame.passingScore, isPassed);

      // Check if this attempt already exists
      const existingProgress = await manager.findOne(VaccinatorUnitGameProgress, {
        where: {
          unitGameId: dto.unitGameId,
          vaccinatorId,
          attempt: dto.attempt,
        },
      });

      let gameProgress: VaccinatorUnitGameProgress;

      if (existingProgress) {
        // Update existing progress
        existingProgress.score = dto.score;
        existingProgress.ratings = dto.ratings ?? null;
        existingProgress.otherFields = dto.otherFields ?? null;
        existingProgress.isPassed = isPassed;
        existingProgress.isCompleted = true; // Always set to true on completion
        existingProgress.xpEarned = xpEarned;
        gameProgress = await manager.save(existingProgress);
      } else {
        // Create new progress
        gameProgress = manager.create(VaccinatorUnitGameProgress, {
          unitGameId: dto.unitGameId,
          vaccinatorId,
          score: dto.score,
          attempt: dto.attempt,
          ratings: dto.ratings ?? null,
          otherFields: dto.otherFields ?? null,
          isPassed: isPassed,
          isCompleted: true, // Always set to true on completion
          xpEarned: xpEarned,
        });

        gameProgress = await manager.save(gameProgress);
      }

      // Check if this lesson is the last lesson of the unit (by orderNo)
      const unitLessons = await manager.find(Lesson, {
        where: { unitId: unit.id },
        order: { orderNo: 'ASC' },
      });

      const currentLessonIndex = unitLessons.findIndex((l) => l.id === lesson.id);
      const isLastLesson = currentLessonIndex >= 0 && currentLessonIndex === unitLessons.length - 1;

      // If this is NOT the last lesson, create progress for next lesson in same unit
      if (!isLastLesson && currentLessonIndex >= 0 && currentLessonIndex < unitLessons.length - 1) {
        const nextLesson = unitLessons[currentLessonIndex + 1];
        const timestamp = new Date();

        // Check if lesson progress already exists for next lesson
        const nextLessonProgress = await manager.findOne(LessonProgress, {
          where: {
            lessonId: nextLesson.id,
            vaccinatorId,
            attemptNumber: 1,
          },
        });

        // Create lesson progress for next lesson if it doesn't exist
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

      // If this is the last lesson, check if unit is completed
      if (isLastLesson) {
        // Get total lessons count
        const totalLessons = unitLessons.length;

        // Check if all lessons are completed by checking lesson_progress entries
        let allLessonsCompleted = true;
        for (const lesson of unitLessons) {
          const lessonProgress = await manager.findOne(LessonProgress, {
            where: {
              lessonId: lesson.id,
              vaccinatorId,
              attemptNumber: 1,
              isCompleted: true,
            },
          });
          if (!lessonProgress) {
            allLessonsCompleted = false;
            break;
          }
        }

        // Check if all unit games are completed
        const unitGames = await manager.find(UnitGame, {
          where: { unitId: unit.id },
        });

        let allGamesCompleted = true;
        if (unitGames.length > 0) {
          for (const ug of unitGames) {
            const gameProg = await manager.findOne(VaccinatorUnitGameProgress, {
              where: {
                unitGameId: ug.id,
                vaccinatorId,
                isCompleted: true,
              },
            });
            if (!gameProg) {
              allGamesCompleted = false;
              break;
            }
          }
        }

        // Unit is completed only if all lessons AND all games are completed
        const isUnitCompleted = allLessonsCompleted && allGamesCompleted;

        // If unit is completed, update unit_progress
        if (isUnitCompleted) {
          const timestamp = new Date();

          // Get or create unit progress
          let unitProgress = await manager.findOne(UnitProgress, {
            where: {
              unitId: unit.id,
              vaccinatorId,
              attemptNumber: 1,
            },
          });

          const wasUnitCompletedBefore = unitProgress?.isCompleted ?? false;

          if (!unitProgress) {
            // Create unit progress if it doesn't exist
            unitProgress = manager.create(UnitProgress, {
              unitId: unit.id,
              vaccinatorId,
              attemptNumber: 1,
              lessonsCompleted: totalLessons,
              currentLessonId: lesson.id,
              masteryLevel: 100,
              isCompleted: true,
              xpEarned: 0,
              startDatetime: timestamp,
              endDatetime: timestamp,
            });
          } else {
            // Update existing unit progress
            unitProgress.lessonsCompleted = totalLessons;
            unitProgress.masteryLevel = 100;
            unitProgress.isCompleted = true;
            unitProgress.endDatetime = timestamp;
          }

          await manager.save(unitProgress);
          const isUnitNewlyCompleted = unitProgress.isCompleted && !wasUnitCompletedBefore;

          // Update module_progress
          let moduleProgress = await manager.findOne(ModuleProgress, {
            where: {
              moduleId: module.id,
              vaccinatorId,
              attemptNumber: 1,
            },
          });

          if (!moduleProgress) {
            // Create module progress if it doesn't exist
            moduleProgress = manager.create(ModuleProgress, {
              moduleId: module.id,
              vaccinatorId,
              attemptNumber: 1,
              unitsCompleted: isUnitNewlyCompleted ? 1 : 0,
              currentUnitId: unit.id,
              masteryLevel: isUnitNewlyCompleted ? 100 : 0,
              isCompleted: false,
              xpEarned: 0,
              startDatetime: timestamp,
            });
          } else {
            // Update existing module progress
            if (isUnitNewlyCompleted) {
              moduleProgress.unitsCompleted += 1;
            }
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

          // Create progress for next unit
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
            const timestamp = new Date();

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
          // If it's the last unit, don't do anything (similar to question submissions)
        }
      }

      // Load relations for response
      const savedProgress = await manager.findOne(VaccinatorUnitGameProgress, {
        where: { id: gameProgress.id },
        relations: ['unitGame', 'unitGame.game', 'unitGame.unit', 'unitGame.lesson', 'vaccinator'],
      });

      return {
        success: true,
        message: 'Game completed successfully',
        data: {
          id: savedProgress?.id,
          unitGameId: savedProgress?.unitGameId,
          vaccinatorId: savedProgress?.vaccinatorId,
          score: savedProgress?.score,
          attempt: savedProgress?.attempt,
          ratings: savedProgress?.ratings,
          otherFields: savedProgress?.otherFields,
          isCompleted: savedProgress?.isCompleted,
          isPassed: savedProgress?.isPassed,
          xpEarned: savedProgress?.xpEarned,
          game: {
            id: savedProgress?.unitGame?.game?.id,
            title: savedProgress?.unitGame?.game?.title,
            url: savedProgress?.unitGame?.game?.url,
          },
          unit: {
            id: savedProgress?.unitGame?.unit?.id,
            title: savedProgress?.unitGame?.unit?.title,
          },
          lesson: {
            id: savedProgress?.unitGame?.lesson?.id,
            title: savedProgress?.unitGame?.lesson?.title,
          },
          createdAt: savedProgress?.createdAt,
          updatedAt: savedProgress?.updatedAt,
        },
      };
    });
  }

  private calculateXpEarned(score: number, passingScore: number, isPassed: boolean): number {
    // Base XP calculation logic
    // You can customize this based on your requirements
    if (!isPassed) {
      return Math.floor(score / 10); // Small XP even if not passed
    }

    // Bonus XP for passing
    const baseXp = passingScore / 10;
    const bonusXp = (score - passingScore) / 10;
    return Math.floor(baseXp + bonusXp);
  }
}


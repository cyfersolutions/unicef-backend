import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { UnitProgress } from './entities/unit-progress.entity';
import { Module } from '../modules/entities/module.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Game } from 'src/games/entities/game.entity';
import { UnitGame } from 'src/games/entities/unit-game.entity';
import { VaccinatorUnitGameProgress } from 'src/games/entities/vaccinator-unit-game-progress.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(UnitProgress)
    private unitProgressRepository: Repository<UnitProgress>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(UnitGame)
    private unitGameRepository: Repository<UnitGame>,
    @InjectRepository(VaccinatorUnitGameProgress)
    private vaccinatorUnitGameProgressRepository: Repository<VaccinatorUnitGameProgress>,
  ) {}

  private async shiftOrderNumbers(moduleId: string, targetOrderNo: number, excludeUnitId?: string) {
    await this.unitRepository
      .createQueryBuilder()
      .update(Unit)
      .set({ orderNo: () => 'order_no + 1' })
      .where('module_id = :moduleId', { moduleId })
      .andWhere('order_no >= :targetOrderNo', { targetOrderNo })
      .andWhere(excludeUnitId ? 'id != :excludeUnitId' : '1=1', excludeUnitId ? { excludeUnitId } : {})
      .execute();
  }

  async create(createUnitDto: CreateUnitDto) {
    // Verify module exists
    const module = await this.moduleRepository.findOne({
      where: { id: createUnitDto.moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with id ${createUnitDto.moduleId} not found`);
    }

    // If orderNo is provided, shift existing units
    if (createUnitDto.orderNo !== undefined && createUnitDto.orderNo !== null) {
      await this.shiftOrderNumbers(createUnitDto.moduleId, createUnitDto.orderNo);
    }

    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findAll(moduleId?: string, filters?: Record<string, any>) {
    const queryBuilder = this.unitRepository
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.module', 'module')
      .loadRelationCountAndMap('unit.totalLessons', 'unit.lessons')
      .orderBy('unit.order_no', 'ASC')
      .addOrderBy('unit.created_at', 'DESC');

    // Filter by moduleId if provided
    if (moduleId) {
      queryBuilder.andWhere('unit.module_id = :moduleId', { moduleId });
    }

    // Apply dynamic filters from query parameters
    if (filters) {
      // Filter by moduleid
      if (filters.moduleId) {
        queryBuilder.andWhere('unit.module_id = :moduleId', { moduleId: filters.moduleId });
      }
      // Filter by title (case-insensitive partial match)
      if (filters.title) {
        queryBuilder.andWhere('unit.title ILIKE :title', { title: `%${filters.title}%` });
      }
    
      // Filter by isActive
      if (filters.isActive !== undefined && filters.isActive !== null) {
        const isActive = filters.isActive === 'true' || filters.isActive === true;
        queryBuilder.andWhere('unit.is_active = :isActive', { isActive });
      }
      // Filter by createdAt (date range)
      if (filters.createdAtFrom) {
        queryBuilder.andWhere('unit.created_at >= :createdAtFrom', { createdAtFrom: filters.createdAtFrom });
      }
      if (filters.createdAtTo) {
        queryBuilder.andWhere('unit.created_at <= :createdAtTo', { createdAtTo: filters.createdAtTo });
      }
    }

    const units = await queryBuilder.getMany();
    
    // Map results to include totalLessons count (loadRelationCountAndMap adds it as a property)
    return units.map((unit) => ({
      ...unit,
      totalLessons: (unit as any).totalLessons || 0,
    }));
  }

  async findOne(id: string) {
    const unit = await this.unitRepository.findOne({
      where: { id },
      relations: ['module'],
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id ${id} not found`);
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    const unit = await this.findOne(id);
    const moduleId = updateUnitDto.moduleId || unit.moduleId;

    // If moduleId is being changed, verify new module exists
    if (updateUnitDto.moduleId && updateUnitDto.moduleId !== unit.moduleId) {
      const module = await this.moduleRepository.findOne({
        where: { id: updateUnitDto.moduleId },
      });

      if (!module) {
        throw new NotFoundException(`Module with id ${updateUnitDto.moduleId} not found`);
      }
    }

    // Handle order number changes
    if (updateUnitDto.orderNo !== undefined && updateUnitDto.orderNo !== null) {
      const oldOrderNo = unit.orderNo;
      const newOrderNo = updateUnitDto.orderNo;
      const isChangingModule = updateUnitDto.moduleId && updateUnitDto.moduleId !== unit.moduleId;

      if (isChangingModule) {
        // Moving to different module: shift in new module, adjust old module
        await this.shiftOrderNumbers(updateUnitDto.moduleId!, newOrderNo, id);
        if (oldOrderNo !== null) {
          await this.unitRepository
            .createQueryBuilder()
            .update(Unit)
            .set({ orderNo: () => 'order_no - 1' })
            .where('module_id = :moduleId', { moduleId: unit.moduleId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .execute();
        }
      } else if (oldOrderNo !== null && oldOrderNo !== newOrderNo) {
        // Same module, reordering
        if (newOrderNo < oldOrderNo) {
          // Moving up: shift units between newOrderNo and oldOrderNo down
          await this.unitRepository
            .createQueryBuilder()
            .update(Unit)
            .set({ orderNo: () => 'order_no + 1' })
            .where('module_id = :moduleId', { moduleId })
            .andWhere('order_no >= :newOrderNo', { newOrderNo })
            .andWhere('order_no < :oldOrderNo', { oldOrderNo })
            .andWhere('id != :unitId', { unitId: id })
            .execute();
        } else {
          // Moving down: shift units between oldOrderNo and newOrderNo up
          await this.unitRepository
            .createQueryBuilder()
            .update(Unit)
            .set({ orderNo: () => 'order_no - 1' })
            .where('module_id = :moduleId', { moduleId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .andWhere('order_no <= :newOrderNo', { newOrderNo })
            .andWhere('id != :unitId', { unitId: id })
            .execute();
        }
      } else if (oldOrderNo === null) {
        // Unit didn't have orderNo, shift existing ones
        await this.shiftOrderNumbers(moduleId, newOrderNo, id);
      }
    }

    Object.assign(unit, updateUnitDto);
    const updatedUnit = await this.unitRepository.save(unit);
    return this.findOne(updatedUnit.id);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const unit = await this.findOne(id);
    return this.update(id, { orderNo: updateOrderDto.orderNo });
  }

  async remove(id: string) {
    const unit = await this.findOne(id);
    const moduleId = unit.moduleId;
    const orderNo = unit.orderNo;

    await this.unitRepository.delete(id);

    // Shift remaining units up
    if (orderNo !== null) {
      await this.unitRepository
        .createQueryBuilder()
        .update(Unit)
        .set({ orderNo: () => 'order_no - 1' })
        .where('module_id = :moduleId', { moduleId })
        .andWhere('order_no > :orderNo', { orderNo })
        .execute();
    }

    return { message: 'Unit deleted successfully' };
  }

  async findOneWithProgress(unitId: string, vaccinatorId: string) {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: ['module'],
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id ${unitId} not found`);
    }

    // Get unit progress - prefer isCompleted false, otherwise get isCompleted true
    const unitProgresses = await this.unitProgressRepository.find({
      where: { unitId, vaccinatorId },
      order: { attemptNumber: 'DESC' },
    });

    // Get the progress: prefer isCompleted false, otherwise get isCompleted true
    let unitProgress = unitProgresses.find((p) => !p.isCompleted);
    if (!unitProgress && unitProgresses.length > 0) {
      unitProgress = unitProgresses.find((p) => p.isCompleted) || unitProgresses[0];
    }

    // Get lessons for this unit with lesson questions count
    const lessons = await this.lessonRepository.find({
      where: { unitId },
      order: { orderNo: 'ASC', createdAt: 'DESC' },
      relations: ['lessonQuestions'],
    });

    // Get all lesson progresses for this vaccinator
    const allLessonProgresses = await this.lessonProgressRepository.find({
      where: { vaccinatorId },
      relations: ['lesson'],
    });

    // Filter lesson progresses for lessons in this unit
    const lessonProgresses = allLessonProgresses.filter((progress) => progress.lesson.unitId === unitId);

    // Group lesson progress by lessonId
    const lessonProgressMap = new Map<string, LessonProgress>();
    for (const progress of lessonProgresses) {
      if (progress.lesson.unitId === unitId) {
        const existing = lessonProgressMap.get(progress.lessonId);
        if (!existing) {
          lessonProgressMap.set(progress.lessonId, progress);
        } else {
          // Prefer isCompleted false, otherwise keep the existing one
          if (!progress.isCompleted && existing.isCompleted) {
            lessonProgressMap.set(progress.lessonId, progress);
          } else if (progress.isCompleted && !existing.isCompleted) {
            // Keep existing (isCompleted false)
          } else {
            // Both same completion status, prefer the one with higher attempt number
            if (progress.attemptNumber > existing.attemptNumber) {
              lessonProgressMap.set(progress.lessonId, progress);
            }
          }
        }
      }
    }

    // Map lessons with progress and total questions count
    const lessonsWithProgress = lessons.map((lesson) => {
      const progress = lessonProgressMap.get(lesson.id);
      return {
        ...lesson,
        progress: progress || null,
        isLocked: !progress, // Locked if no progress exists
        totalQuestions: lesson.lessonQuestions?.length || 0,
      };
    });

    return {
      ...unit,
      progress: unitProgress || null,
      isLocked: !unitProgress, // Locked if no progress exists
      lessons: lessonsWithProgress,
      totalLessons: lessons.length,
    };
  }

  async findAllByModuleWithProgress(moduleId: string, vaccinatorId: string) {
    // Verify module exists
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    // Get all units for this module
    const units = await this.unitRepository.find({
      where: { moduleId },
      order: { orderNo: 'ASC', createdAt: 'DESC' },
    });

    const unitIds = units.map((unit) => unit.id);

    const unitGames = await this.unitGameRepository.find({
      where: { unitId: In(unitIds) },
      relations: ['game'],
    });

    // Get game progress for this vaccinator
    const unitGameIds = unitGames.map((ug) => ug.id);
    const gameProgresses = unitGameIds.length > 0
      ? await this.vaccinatorUnitGameProgressRepository.find({
          where: {
            vaccinatorId,
            unitGameId: In(unitGameIds),
            isCompleted: true,
          },
        })
      : [];
    
    // Create a map of unitGameId -> progress
    const gameProgressMap = new Map<string, VaccinatorUnitGameProgress>();
    gameProgresses.forEach((progress) => {
      gameProgressMap.set(progress.unitGameId, progress);
    });


    // Get unit progresses only for units in this module (avoid in-memory filtering + mismatches)
    const unitProgresses =
      unitIds.length > 0
        ? await this.unitProgressRepository.find({
            where: { vaccinatorId, unitId: In(unitIds) },
          })
        : [];

    // Get all lessons for all units in this module
    const allLessons = unitIds.length > 0
      ? await this.lessonRepository.find({
          where: { unitId: In(unitIds) },
          order: { orderNo: 'ASC', createdAt: 'DESC' },
          relations: ['lessonQuestions'],
        })
      : [];

    const lessonIds = allLessons.map((l) => l.id);

    // Get lesson progresses only for lessons in this module
    // Use a more explicit query to ensure it works correctly
    const allLessonProgresses =
      lessonIds.length > 0
        ? await this.lessonProgressRepository
            .createQueryBuilder('lp')
            .where('lp.vaccinator_id = :vaccinatorId', { vaccinatorId })
            .andWhere('lp.lesson_id IN (:...lessonIds)', { lessonIds })
            .getMany()
        : [];

    // Group unit progress by unitId
    const unitProgressMap = new Map<string, UnitProgress>();
    for (const progress of unitProgresses) {
      const existing = unitProgressMap.get(progress.unitId);
      if (!existing) {
        unitProgressMap.set(progress.unitId, progress);
      } else {
        // Prefer isCompleted false, otherwise keep the existing one
        if (!progress.isCompleted && existing.isCompleted) {
          unitProgressMap.set(progress.unitId, progress);
        } else if (progress.isCompleted && !existing.isCompleted) {
          // Keep existing (isCompleted false)
        } else {
          // Both same completion status, prefer the one with higher attempt number
          if (progress.attemptNumber > existing.attemptNumber) {
            unitProgressMap.set(progress.unitId, progress);
          }
        }
      }
    }

    // Group lesson progress by lessonId
    const lessonProgressMap = new Map<string, LessonProgress>();
    for (const progress of allLessonProgresses) {
      const existing = lessonProgressMap.get(progress.lessonId);

      console.log(progress,'progress',existing,'existing')

      if (!existing) {
        lessonProgressMap.set(progress.lessonId, progress);
        continue;
      }

      // // Prefer isCompleted false, otherwise keep the existing one
      // if (!progress.isCompleted && existing.isCompleted) {
      //   lessonProgressMap.set(progress.lessonId, progress);
      // } else if (progress.isCompleted && !existing.isCompleted) {
      //   // Keep existing (isCompleted false)
      // } else {
      //   // Both same completion status, prefer the one with higher attempt number
      //   if (progress.attemptNumber > existing.attemptNumber) {
      //     lessonProgressMap.set(progress.lessonId, progress);
      //   }
      // }
    }

    console.log(lessonProgressMap,'lessonProgressMap')

    // Map units with progress and lessons
    return units.map((unit) => {
      const unitProgress = unitProgressMap.get(unit.id);
      
      // Get lessons for this unit
      const unitLessons = allLessons.filter((lesson) => lesson.unitId === unit.id);
      
      // Map lessons with progress and total questions count
      const lessonsWithProgress = unitLessons.map((lesson) => {
        const lessonProgress = lessonProgressMap.get(lesson.id);



        return {
          ...lesson,
          progress: lessonProgress || null,
          isLocked: !lessonProgress, // Locked if no progress exists
          totalQuestions: lesson.lessonQuestions?.length || 0,
        };
      });


      // console.log(lessonsWithProgress,'lessonsWithProgress')

      // Map games with progress
      const unitGamesWithProgress = unitGames
        .filter((ug) => ug.unitId === unit.id)
        .map((ug) => ({
          ...ug,
          progress: gameProgressMap.get(ug.id) || null,
        }));

      return {
        ...unit,
        progress: unitProgress || null,
        isLocked: !unitProgress, // Locked if no progress exists
        lessons: lessonsWithProgress,
        games: unitGamesWithProgress,
        totalLessons: unitLessons.length,
      };
    });
  }
}

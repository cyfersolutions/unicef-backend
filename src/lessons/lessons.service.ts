import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Unit } from '../units/entities/unit.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  private async shiftOrderNumbers(unitId: string, targetOrderNo: number, excludeLessonId?: string) {
    await this.lessonRepository
      .createQueryBuilder()
      .update(Lesson)
      .set({ orderNo: () => 'order_no + 1' })
      .where('unit_id = :unitId', { unitId })
      .andWhere('order_no >= :targetOrderNo', { targetOrderNo })
      .andWhere(excludeLessonId ? 'id != :excludeLessonId' : '1=1', excludeLessonId ? { excludeLessonId } : {})
      .execute();
  }

  async create(createLessonDto: CreateLessonDto) {
    // Verify unit exists
    const unit = await this.unitRepository.findOne({
      where: { id: createLessonDto.unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id ${createLessonDto.unitId} not found`);
    }

    // If orderNo is provided, shift existing lessons
    if (createLessonDto.orderNo !== undefined && createLessonDto.orderNo !== null) {
      await this.shiftOrderNumbers(createLessonDto.unitId, createLessonDto.orderNo);
    }

    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async findAll(unitId?: string) {
    const where = unitId ? { unitId } : {};
    return await this.lessonRepository.find({
      where,
      relations: ['unit'],
      order: { orderNo: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['unit'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.findOne(id);
    const unitId = updateLessonDto.unitId || lesson.unitId;

    // If unitId is being changed, verify new unit exists
    if (updateLessonDto.unitId && updateLessonDto.unitId !== lesson.unitId) {
      const unit = await this.unitRepository.findOne({
        where: { id: updateLessonDto.unitId },
      });

      if (!unit) {
        throw new NotFoundException(`Unit with id ${updateLessonDto.unitId} not found`);
      }
    }

    // Handle order number changes
    if (updateLessonDto.orderNo !== undefined && updateLessonDto.orderNo !== null) {
      const oldOrderNo = lesson.orderNo;
      const newOrderNo = updateLessonDto.orderNo;
      const isChangingUnit = updateLessonDto.unitId && updateLessonDto.unitId !== lesson.unitId;

      if (isChangingUnit) {
        // Moving to different unit: shift in new unit, adjust old unit
        await this.shiftOrderNumbers(updateLessonDto.unitId!, newOrderNo, id);
        if (oldOrderNo !== null) {
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no - 1' })
            .where('unit_id = :unitId', { unitId: lesson.unitId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .execute();
        }
      } else if (oldOrderNo !== null && oldOrderNo !== newOrderNo) {
        // Same unit, reordering
        if (newOrderNo < oldOrderNo) {
          // Moving up: shift lessons between newOrderNo and oldOrderNo down
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no + 1' })
            .where('unit_id = :unitId', { unitId })
            .andWhere('order_no >= :newOrderNo', { newOrderNo })
            .andWhere('order_no < :oldOrderNo', { oldOrderNo })
            .andWhere('id != :lessonId', { lessonId: id })
            .execute();
        } else {
          // Moving down: shift lessons between oldOrderNo and newOrderNo up
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no - 1' })
            .where('unit_id = :unitId', { unitId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .andWhere('order_no <= :newOrderNo', { newOrderNo })
            .andWhere('id != :lessonId', { lessonId: id })
            .execute();
        }
      } else if (oldOrderNo === null) {
        // Lesson didn't have orderNo, shift existing ones
        await this.shiftOrderNumbers(unitId, newOrderNo, id);
      }
    }

    await this.lessonRepository.update(id, updateLessonDto);
    return this.findOne(id);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const lesson = await this.findOne(id);
    return this.update(id, { orderNo: updateOrderDto.orderNo });
  }

  async remove(id: string) {
    const lesson = await this.findOne(id);
    const unitId = lesson.unitId;
    const orderNo = lesson.orderNo;

    await this.lessonRepository.delete(id);

    // Shift remaining lessons up
    if (orderNo !== null) {
      await this.lessonRepository
        .createQueryBuilder()
        .update(Lesson)
        .set({ orderNo: () => 'order_no - 1' })
        .where('unit_id = :unitId', { unitId })
        .andWhere('order_no > :orderNo', { orderNo })
        .execute();
    }

    return { message: 'Lesson deleted successfully' };
  }
}


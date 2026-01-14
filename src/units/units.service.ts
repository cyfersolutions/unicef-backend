import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { Module } from '../modules/entities/module.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
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

  async findAll(moduleId?: string) {
    const where = moduleId ? { moduleId } : {};
    return await this.unitRepository.find({
      where,
      relations: ['module'],
      order: { orderNo: 'ASC', createdAt: 'DESC' },
    });
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

    await this.unitRepository.update(id, updateUnitDto);
    return this.findOne(id);
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
}

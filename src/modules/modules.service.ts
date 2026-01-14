import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  private async shiftModuleOrderNumbers(targetOrderNo: number, excludeModuleId?: string) {
    await this.moduleRepository
      .createQueryBuilder()
      .update(Module)
      .set({ orderNo: () => 'order_no + 1' })
      .where('order_no >= :targetOrderNo', { targetOrderNo })
      .andWhere(excludeModuleId ? 'id != :excludeModuleId' : '1=1', excludeModuleId ? { excludeModuleId } : {})
      .execute();
  }

  async create(createModuleDto: CreateModuleDto) {
    // If orderNo is provided, shift existing modules
    if (createModuleDto.orderNo !== undefined && createModuleDto.orderNo !== null) {
      await this.shiftModuleOrderNumbers(createModuleDto.orderNo);
    }

    const module = this.moduleRepository.create(createModuleDto);
    return await this.moduleRepository.save(module);
  }

  async findAll() {
    return await this.moduleRepository.find({
      order: { orderNo: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException(`Module with id ${id} not found`);
    }

    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto) {
    const module = await this.findOne(id);

    // Handle order number changes
    if (updateModuleDto.orderNo !== undefined && updateModuleDto.orderNo !== null) {
      const oldOrderNo = module.orderNo;
      const newOrderNo = updateModuleDto.orderNo;

      if (oldOrderNo !== null && oldOrderNo !== newOrderNo) {
        if (newOrderNo < oldOrderNo) {
          // Moving up: shift modules between newOrderNo and oldOrderNo down
          await this.moduleRepository
            .createQueryBuilder()
            .update(Module)
            .set({ orderNo: () => 'order_no + 1' })
            .where('order_no >= :newOrderNo', { newOrderNo })
            .andWhere('order_no < :oldOrderNo', { oldOrderNo })
            .andWhere('id != :moduleId', { moduleId: id })
            .execute();
        } else if (newOrderNo > oldOrderNo) {
          // Moving down: shift modules between oldOrderNo and newOrderNo up
          await this.moduleRepository
            .createQueryBuilder()
            .update(Module)
            .set({ orderNo: () => 'order_no - 1' })
            .where('order_no > :oldOrderNo', { oldOrderNo })
            .andWhere('order_no <= :newOrderNo', { newOrderNo })
            .andWhere('id != :moduleId', { moduleId: id })
            .execute();
        }
      } else if (oldOrderNo === null) {
        // Module didn't have orderNo, shift existing ones
        await this.shiftModuleOrderNumbers(newOrderNo, id);
      }
    }

    await this.moduleRepository.update(id, updateModuleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const module = await this.findOne(id);
    const orderNo = module.orderNo;

    await this.moduleRepository.delete(id);

    // Shift remaining modules up
    if (orderNo !== null) {
      await this.moduleRepository
        .createQueryBuilder()
        .update(Module)
        .set({ orderNo: () => 'order_no - 1' })
        .where('order_no > :orderNo', { orderNo })
        .execute();
    }

    return { message: 'Module deleted successfully' };
  }

  async updateOrder(id: string, orderNo: number) {
    return this.update(id, { orderNo });
  }
}

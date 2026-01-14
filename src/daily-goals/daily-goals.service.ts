import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyGoal } from './entities/daily-goal.entity';
import { CreateDailyGoalDto } from './dto/create-daily-goal.dto';
import { UpdateDailyGoalDto } from './dto/update-daily-goal.dto';

@Injectable()
export class DailyGoalsService {
  constructor(
    @InjectRepository(DailyGoal)
    private dailyGoalRepository: Repository<DailyGoal>,
  ) {}

  async create(createDailyGoalDto: CreateDailyGoalDto) {
    const dailyGoal = this.dailyGoalRepository.create(createDailyGoalDto);
    return await this.dailyGoalRepository.save(dailyGoal);
  }

  async findAll() {
    return await this.dailyGoalRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const dailyGoal = await this.dailyGoalRepository.findOne({
      where: { id },
    });

    if (!dailyGoal) {
      throw new NotFoundException(`Daily goal with id ${id} not found`);
    }

    return dailyGoal;
  }

  async update(id: string, updateDailyGoalDto: UpdateDailyGoalDto) {
    await this.dailyGoalRepository.update(id, updateDailyGoalDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.dailyGoalRepository.delete(id);
    return { message: 'Daily goal deleted successfully' };
  }
}

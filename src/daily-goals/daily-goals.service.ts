import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyGoal } from './entities/daily-goal.entity';
import { DailyGoalProgress } from './entities/daily-goal-progress.entity';
import { CreateDailyGoalDto } from './dto/create-daily-goal.dto';
import { UpdateDailyGoalDto } from './dto/update-daily-goal.dto';
import { SubmitDailyGoalProgressDto } from './dto/submit-daily-goal-progress.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class DailyGoalsService {
  constructor(
    @InjectRepository(DailyGoal)
    private dailyGoalRepository: Repository<DailyGoal>,
    @InjectRepository(DailyGoalProgress)
    private dailyGoalProgressRepository: Repository<DailyGoalProgress>,
    private queueService: QueueService,
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

  async submitDailyGoalProgress(dto: SubmitDailyGoalProgressDto) {
    // Validate daily goal progress exists and get vaccinatorId
    const dailyGoalProgress = await this.dailyGoalProgressRepository.findOne({
      where: { id: dto.dailyGoalProgressId },
      relations: ['vaccinator'],
    });

    if (!dailyGoalProgress) {
      throw new NotFoundException(`Daily goal progress with ID ${dto.dailyGoalProgressId} not found`);
    }

    // Add job to queue
    const job = await this.queueService.addDailyGoalProgress({
      dailyGoalProgressId: dto.dailyGoalProgressId,
      userValue: dto.userValue,
      vaccinatorId: dailyGoalProgress.vaccinatorId,
    });

    return {
      success: true,
      message: 'Daily goal progress submitted successfully, processing in background',
      jobId: job.id,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Streak } from './entities/streak.entity';
import { StreakProgress } from './entities/streak-progress.entity';
import { CreateStreakDto } from './dto/create-streak.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';
import { SubmitStreakProgressDto } from './dto/submit-streak-progress.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streak)
    private streakRepository: Repository<Streak>,
    @InjectRepository(StreakProgress)
    private streakProgressRepository: Repository<StreakProgress>,
    private queueService: QueueService,
  ) {}

  async create(createStreakDto: CreateStreakDto) {
    const streak = this.streakRepository.create(createStreakDto);
    return await this.streakRepository.save(streak);
  }

  async findAll() {
    return await this.streakRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const streak = await this.streakRepository.findOne({
      where: { id },
    });

    if (!streak) {
      throw new NotFoundException(`Streak with id ${id} not found`);
    }

    return streak;
  }

  async update(id: string, updateStreakDto: UpdateStreakDto) {
    await this.streakRepository.update(id, updateStreakDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.streakRepository.delete(id);
    return { message: 'Streak deleted successfully' };
  }

  async submitStreakProgress(dto: SubmitStreakProgressDto) {
    // Validate streak progress exists and get vaccinatorId
    const streakProgress = await this.streakProgressRepository.findOne({
      where: { id: dto.streakProgressId },
      relations: ['vaccinator'],
    });

    if (!streakProgress) {
      throw new NotFoundException(`Streak progress with ID ${dto.streakProgressId} not found`);
    }

    // Add job to queue
    const job = await this.queueService.addStreakProgress({
      streakProgressId: dto.streakProgressId,
      date: dto.date,
      vaccinatorId: streakProgress.vaccinatorId,
    });

    return {
      success: true,
      message: 'Streak progress submitted successfully, processing in background',
      jobId: job.id,
    };
  }
}

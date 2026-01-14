import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Streak } from './entities/streak.entity';
import { CreateStreakDto } from './dto/create-streak.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streak)
    private streakRepository: Repository<Streak>,
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
}

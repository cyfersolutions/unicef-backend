import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
  ) {}

  async create(createBadgeDto: CreateBadgeDto) {
    const badge = this.badgeRepository.create(createBadgeDto);
    return await this.badgeRepository.save(badge);
  }

  async findAll() {
    return await this.badgeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const badge = await this.badgeRepository.findOne({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException(`Badge with id ${id} not found`);
    }

    return badge;
  }

  async update(id: string, updateBadgeDto: UpdateBadgeDto) {
    await this.badgeRepository.update(id, updateBadgeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.badgeRepository.delete(id);
    return { message: 'Badge deleted successfully' };
  }
}

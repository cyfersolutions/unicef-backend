import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardRule } from './entities/reward-rule.entity';
import { CreateRewardRuleDto } from './dto/create-reward-rule.dto';
import { UpdateRewardRuleDto } from './dto/update-reward-rule.dto';

@Injectable()
export class RewardRulesService {
  constructor(
    @InjectRepository(RewardRule)
    private rewardRuleRepository: Repository<RewardRule>,
  ) {}

  async create(createRewardRuleDto: CreateRewardRuleDto) {
    const rewardRule = this.rewardRuleRepository.create(createRewardRuleDto);
    return await this.rewardRuleRepository.save(rewardRule);
  }

  async findAll() {
    return await this.rewardRuleRepository.find({
      relations: ['badge', 'certificate', 'streak', 'dailyGoal'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const rewardRule = await this.rewardRuleRepository.findOne({
      where: { id },
      relations: ['badge', 'certificate', 'streak', 'dailyGoal'],
    });

    if (!rewardRule) {
      throw new NotFoundException(`Reward rule with id ${id} not found`);
    }

    return rewardRule;
  }

  async update(id: string, updateRewardRuleDto: UpdateRewardRuleDto) {
    await this.rewardRuleRepository.update(id, updateRewardRuleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.rewardRuleRepository.delete(id);
    return { message: 'Reward rule deleted successfully' };
  }
}

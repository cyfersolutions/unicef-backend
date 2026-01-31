import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DailyGoalProgress } from '../daily-goals/entities/daily-goal-progress.entity';
import { RewardCalculationService, CalculatedRewards } from './reward-calculation.service';
import { VaccinatorSummary } from '../users/entities/vaccinator-summary.entity';

export interface UpdateDailyGoalProgressInput {
  dailyGoalProgressId: string;
  userValue: number;
}

@Injectable()
export class DailyGoalProgressUpdateService {
  constructor(
    @InjectRepository(DailyGoalProgress)
    private dailyGoalProgressRepository: Repository<DailyGoalProgress>,
    @InjectRepository(VaccinatorSummary)
    private vaccinatorSummaryRepository: Repository<VaccinatorSummary>,
    private dataSource: DataSource,
    private rewardCalculationService: RewardCalculationService,
  ) {}

  async updateDailyGoalProgress(input: UpdateDailyGoalProgressInput): Promise<{
    dailyGoalProgress: DailyGoalProgress;
    rewards: CalculatedRewards;
    wasJustAchieved: boolean;
  }> {
    const { dailyGoalProgressId, userValue } = input;

    return await this.dataSource.transaction(async (manager) => {
      // Get current daily goal progress
      const dailyGoalProgress = await manager.findOne(DailyGoalProgress, {
        where: { id: dailyGoalProgressId },
        relations: ['goal', 'vaccinator'],
      });

      if (!dailyGoalProgress) {
        throw new Error(`Daily goal progress ${dailyGoalProgressId} not found`);
      }

      const vaccinatorId = dailyGoalProgress.vaccinatorId;
      const goalId = dailyGoalProgress.goalId;

      // Check if already achieved
      const wasAlreadyAchieved = dailyGoalProgress.isAchieved;

      // Update current goal value
      dailyGoalProgress.currentGoalValue += userValue;

      // Check if goal is achieved (current >= threshold)
      const wasJustAchieved = !wasAlreadyAchieved && dailyGoalProgress.currentGoalValue >= dailyGoalProgress.goalValue;

      if (dailyGoalProgress.currentGoalValue >= dailyGoalProgress.goalValue) {
        dailyGoalProgress.isAchieved = true;
      }

      // Save updated progress
      const updatedProgress = await manager.save(dailyGoalProgress);

      // Calculate rewards based on updated daily goal progress
      const rewards = await this.rewardCalculationService.calculateDailyGoalRewards({
        dailyGoalProgressId: updatedProgress.id,
        vaccinatorId,
        goalId,
        dailyGoalProgress: updatedProgress,
        transactionManager: manager,
      });

      // Update vaccinator summary
      let vaccinatorSummary = await manager.findOne(VaccinatorSummary, {
        where: { vaccinatorId },
      });

      if (!vaccinatorSummary) {
        vaccinatorSummary = manager.create(VaccinatorSummary, {
          vaccinatorId,
          totalXp: rewards.xp,
          totalBadges: rewards.badges.length,
          totalCertificates: rewards.certificates.length,
          modulesCompleted: 0,
          unitsCompleted: 0,
          lessonsCompleted: 0,
          questionsAnswered: 0,
          questionsCorrect: 0,
          overallAccuracy: 0,
        });
      } else {
        vaccinatorSummary.totalXp += rewards.xp;
        vaccinatorSummary.totalBadges += rewards.badges.length;
        vaccinatorSummary.totalCertificates += rewards.certificates.length;
      }

      await manager.save(vaccinatorSummary);

      return {
        dailyGoalProgress: updatedProgress,
        rewards,
        wasJustAchieved,
      };
    });
  }
}


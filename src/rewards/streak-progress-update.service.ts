import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StreakProgress } from '../streaks/entities/streak-progress.entity';
import { RewardCalculationService, CalculatedRewards } from './reward-calculation.service';
import { VaccinatorSummary } from '../users/entities/vaccinator-summary.entity';

export interface UpdateStreakProgressInput {
  streakProgressId: string;
  date: Date;
}

@Injectable()
export class StreakProgressUpdateService {
  constructor(
    @InjectRepository(StreakProgress)
    private streakProgressRepository: Repository<StreakProgress>,
    @InjectRepository(VaccinatorSummary)
    private vaccinatorSummaryRepository: Repository<VaccinatorSummary>,
    private dataSource: DataSource,
    private rewardCalculationService: RewardCalculationService,
  ) {}

  async updateStreakProgress(input: UpdateStreakProgressInput): Promise<{
    streakProgress: StreakProgress;
    rewards: CalculatedRewards;
    isNewStreak: boolean;
  }> {
    const { streakProgressId, date } = input;

    return await this.dataSource.transaction(async (manager) => {
      // Get current streak progress
      const streakProgress = await manager.findOne(StreakProgress, {
        where: { id: streakProgressId },
        relations: ['streak', 'vaccinator'],
      });

      if (!streakProgress) {
        throw new Error(`Streak progress ${streakProgressId} not found`);
      }

      const vaccinatorId = streakProgress.vaccinatorId;
      const streakId = streakProgress.streakId;

      // Normalize dates to compare only dates (not time)
      const activityDate = new Date(date);
      activityDate.setHours(0, 0, 0, 0);

      const yesterday = new Date(activityDate);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastAchievedDate = streakProgress.lastAchievedDate
        ? new Date(streakProgress.lastAchievedDate)
        : null;
      if (lastAchievedDate) {
        lastAchievedDate.setHours(0, 0, 0, 0);
      }

      let isNewStreak = false;
      let currentStreakProgress = streakProgress;

      // Check if streak is still alive (last achieved date is yesterday)
      if (lastAchievedDate && lastAchievedDate.getTime() === yesterday.getTime()) {
        // Streak is alive - continue current streak
        currentStreakProgress.currentStreakValue += 1;
        currentStreakProgress.lastAchievedDate = activityDate;
        currentStreakProgress.inProgress = true;

        // Check if streak is achieved (you may want to add a threshold)
        // For now, we'll check if currentStreakValue meets some criteria
        if (currentStreakProgress.currentStreakValue > 0) {
          currentStreakProgress.isAchieved = true;
        }
      } else if (lastAchievedDate && lastAchievedDate.getTime() === activityDate.getTime()) {
        // Already submitted today - don't increment, just update lastAchievedDate
        currentStreakProgress.lastAchievedDate = activityDate;
      } else {
        // Streak is broken (last achieved date is not yesterday) - end current streak and create new one
        currentStreakProgress.inProgress = false;
        currentStreakProgress.endDate = activityDate;
        await manager.save(currentStreakProgress);

        // Create new streak progress record
        const newStreakProgress = manager.create(StreakProgress, {
          streakId,
          vaccinatorId,
          currentStreakValue: 1,
          isAchieved: false,
          inProgress: true,
          startDate: activityDate,
          lastAchievedDate: activityDate,
        });

        currentStreakProgress = await manager.save(newStreakProgress);
        isNewStreak = true;
      }

      // Calculate rewards based on updated streak progress
      const rewards = await this.rewardCalculationService.calculateStreakRewards({
        streakProgressId: currentStreakProgress.id,
        vaccinatorId,
        streakId,
        streakProgress: currentStreakProgress,
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
        streakProgress: currentStreakProgress,
        rewards,
        isNewStreak,
      };
    });
  }
}


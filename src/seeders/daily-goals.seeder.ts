import { DataSource } from 'typeorm';
import { DailyGoal } from '../daily-goals/entities/daily-goal.entity';
import { DailyGoalType } from '../common/enums/daily-goal-type.enum';

export async function seedDailyGoals(dataSource: DataSource): Promise<void> {
  const dailyGoalRepository = dataSource.getRepository(DailyGoal);

  const dailyGoals = [
    {
      type: DailyGoalType.TIME_SPENT,
      title: 'Time Spent Goal',
      description: 'Set a daily goal for the amount of time you want to spend learning. Track your progress and stay motivated.',
      isActive: true,
    },
    {
      type: DailyGoalType.LESSON_COMPLETED,
      title: 'Lesson Completed Goal',
      description: 'Set a daily goal for the number of lessons you want to complete. Challenge yourself and achieve your learning targets.',
      isActive: true,
    },
    {
      type: DailyGoalType.MODULE_COMPLETED,
      title: 'Module Completed Goal',
      description: 'Set a daily goal for completing modules. Make steady progress through your learning journey.',
      isActive: true,
    },
    {
      type: DailyGoalType.UNITS_COMPLETED,
      title: 'Units Completed Goal',
      description: 'Set a daily goal for completing units. Break down your learning into manageable daily targets.',
      isActive: true,
    },
  ];

  for (const dailyGoalData of dailyGoals) {
    const existingDailyGoal = await dailyGoalRepository.findOne({
      where: { type: dailyGoalData.type },
    });

    if (!existingDailyGoal) {
      const dailyGoal = dailyGoalRepository.create(dailyGoalData);
      await dailyGoalRepository.save(dailyGoal);
      console.log(`✓ Created daily goal: ${dailyGoalData.title} (${dailyGoalData.type})`);
    } else {
      console.log(`- Daily goal already exists: ${dailyGoalData.title} (${dailyGoalData.type})`);
    }
  }
}


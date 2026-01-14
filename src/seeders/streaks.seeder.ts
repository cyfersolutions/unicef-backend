import { DataSource } from 'typeorm';
import { Streak } from '../streaks/entities/streak.entity';
import { StreakType } from '../common/enums/streak-type.enum';

export async function seedStreaks(dataSource: DataSource): Promise<void> {
  const streakRepository = dataSource.getRepository(Streak);

  const streaks = [
    {
      type: StreakType.DAILY_LOGIN,
      title: 'Daily Login Streak',
      description: 'Maintain a daily login streak to earn rewards and track your consistency.',
      isActive: true,
    },
    {
      type: StreakType.DAILY_PRACTICE,
      title: 'Daily Practice Streak',
      description: 'Complete daily practice sessions to build your learning streak and unlock achievements.',
      isActive: true,
    },
    {
      type: StreakType.LESSONS_COMPLETED,
      title: 'Lessons Completed Streak',
      description: 'Complete lessons consecutively to maintain your streak and earn bonus rewards.',
      isActive: true,
    },
  ];

  for (const streakData of streaks) {
    const existingStreak = await streakRepository.findOne({
      where: { type: streakData.type },
    });

    if (!existingStreak) {
      const streak = streakRepository.create(streakData);
      await streakRepository.save(streak);
      console.log(`✓ Created streak: ${streakData.title} (${streakData.type})`);
    } else {
      console.log(`- Streak already exists: ${streakData.title} (${streakData.type})`);
    }
  }
}


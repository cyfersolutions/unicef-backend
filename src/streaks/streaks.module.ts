import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { Streak } from './entities/streak.entity';
import { StreakProgress } from './entities/streak-progress.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Streak, StreakProgress, Vaccinator]),
    QueueModule,
  ],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}

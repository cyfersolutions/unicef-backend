import { Module } from '@nestjs/common';
import { DailyPracticeService } from './daily-practice.service';
import { DailyPracticeController } from './daily-practice.controller';

@Module({
  controllers: [DailyPracticeController],
  providers: [DailyPracticeService],
})
export class DailyPracticeModule {}

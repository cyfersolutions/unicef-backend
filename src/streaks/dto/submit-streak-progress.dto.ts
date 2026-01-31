import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class SubmitStreakProgressDto {
  @ApiProperty({ description: 'Streak Progress UUID' })
  @IsUUID()
  streakProgressId: string;

  @ApiProperty({ description: 'Date of streak activity (YYYY-MM-DD)', example: '2024-01-30' })
  @IsDateString()
  date: string;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class SubmitDailyGoalProgressDto {
  @ApiProperty({ description: 'Daily Goal Progress UUID' })
  @IsUUID()
  dailyGoalProgressId: string;

  @ApiProperty({ description: 'User value to add to current goal value', minimum: 0 })
  @IsNumber()
  @Min(0)
  userValue: number;
}


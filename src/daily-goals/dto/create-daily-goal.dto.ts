import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DailyGoalType } from '../../common/enums/daily-goal-type.enum';

export class CreateDailyGoalDto {
  @ApiProperty({
    description: 'Type of daily goal',
    enum: DailyGoalType,
    example: DailyGoalType.TIME_SPENT,
  })
  @IsEnum(DailyGoalType, { message: 'Type must be a valid DailyGoalType enum value' })
  type: DailyGoalType;

  @ApiProperty({
    description: 'Title of the daily goal',
    example: 'Spend 30 minutes learning',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  title: string;

  @ApiProperty({
    description: 'Description of the daily goal',
    example: 'Complete 30 minutes of learning activities today',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string | null;

  @ApiProperty({
    description: 'Whether the daily goal is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

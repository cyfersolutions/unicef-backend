import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StreakType } from '../../common/enums/streak-type.enum';

export class CreateStreakDto {
  @ApiProperty({
    description: 'Type of streak',
    enum: StreakType,
    example: StreakType.DAILY_LOGIN,
  })
  @IsEnum(StreakType, { message: 'Type must be a valid StreakType enum value' })
  type: StreakType;

  @ApiProperty({
    description: 'Title of the streak',
    example: 'Daily Login Streak',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  title: string;

  @ApiProperty({
    description: 'Description of the streak',
    example: 'Maintain a daily login streak to earn rewards',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string | null;

  @ApiProperty({
    description: 'Whether the streak is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBadgeDto {
  @ApiProperty({
    description: 'Name of the badge',
    example: 'First Lesson Complete',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    description: 'Tier of the badge',
    example: 'Bronze',
  })
  @IsString({ message: 'Tier must be a string' })
  @MinLength(1, { message: 'Tier must be at least 1 character long' })
  tier: string;

  @ApiProperty({
    description: 'Description of the badge',
    example: 'Complete your first lesson',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'URL to the badge icon',
    example: 'https://example.com/badge-icon.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Icon URL must be a string' })
  iconUrl?: string | null;

  @ApiProperty({
    description: 'Whether the badge is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

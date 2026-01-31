import { IsString, IsOptional, IsInt, IsBoolean, IsUUID, IsNumber, MinLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Lesson title',
    example: 'Introduction to Vaccine Safety',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Lesson description',
    example: 'This lesson covers the basics of vaccine safety protocols',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Order number for sorting lessons within a unit',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Order number must be an integer' })
  orderNo?: number;

  @ApiProperty({
    description: 'Whether the lesson is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Unit ID that this lesson belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Unit ID must be a valid UUID' })
  unitId: string;

  @ApiProperty({
    description: 'Pass threshold percentage (0-100)',
    example: 70.5,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Pass threshold must be a number with max 2 decimal places' })
  @Min(0, { message: 'Pass threshold must be at least 0' })
  @Max(100, { message: 'Pass threshold must be at most 100' })
  passThreshold?: number;

  @ApiProperty({
    description: 'Failed threshold percentage (0-100)',
    example: 50.0,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Failed threshold must be a number with max 2 decimal places' })
  @Min(0, { message: 'Failed threshold must be at least 0' })
  @Max(100, { message: 'Failed threshold must be at most 100' })
  failedThreshold?: number;

  @ApiProperty({
    description: 'Icon URL for the lesson',
    example: 'https://example.com/lesson-icon.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Icon URL must be a string' })
  iconUrl?: string | null;
}


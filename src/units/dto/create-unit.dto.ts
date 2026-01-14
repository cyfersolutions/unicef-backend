import { IsString, IsOptional, IsInt, IsBoolean, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Unit title',
    example: 'Introduction to Vaccines',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Unit description',
    example: 'This unit covers the basics of vaccines',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Order number for sorting units within a module',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Order number must be an integer' })
  orderNo?: number;

  @ApiProperty({
    description: 'Whether the unit is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Module ID that this unit belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Module ID must be a valid UUID' })
  moduleId: string;
}

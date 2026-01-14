import { IsString, IsOptional, IsInt, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Module title',
    example: 'Introduction to Vaccination',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Module description',
    example: 'This module covers the basics of vaccination procedures',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Order number for sorting modules',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Order number must be an integer' })
  orderNo?: number;

  @ApiProperty({
    description: 'Whether the module is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

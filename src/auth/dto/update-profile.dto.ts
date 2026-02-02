import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+923001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address', example: '123 Main Street, City' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Province', example: 'Punjab' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Senior Vaccinator' })
  @IsString()
  @IsOptional()
  designation?: string;
}


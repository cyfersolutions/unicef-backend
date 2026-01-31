import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonalInfoDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'CNIC number', example: '12345-1234567-1' })
  @IsString()
  @IsNotEmpty()
  cnic: string;

  @ApiProperty({ description: 'Phone number', example: '+923001234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Address', example: '123 Main Street, City' })
  @IsString()
  @IsOptional()
  address?: string;
}


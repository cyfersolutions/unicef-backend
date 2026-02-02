import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class SubmitOnboardingResponseDto {
  @ApiProperty({ description: 'Question ID' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Selected answer (option text)' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ description: 'Response datetime', required: false })
  @IsDateString()
  @IsOptional()
  datetime?: string;
}


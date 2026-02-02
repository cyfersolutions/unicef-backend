import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOnboardingQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ description: 'Question image URL (optional)', required: false })
  @IsString()
  @IsOptional()
  questionImage?: string | null;

  @ApiProperty({ description: 'Array of option strings', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  options: string[];
}


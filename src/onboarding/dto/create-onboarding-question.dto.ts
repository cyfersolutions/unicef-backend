import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsInt, Min } from 'class-validator';

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

  @ApiProperty({ description: 'Order number', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  orderNo?: number | null;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionAnswerDto {
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

export class SubmitOnboardingResponsesDto {
  @ApiProperty({ 
    description: 'Array of question-answer pairs',
    type: [QuestionAnswerDto],
    example: [
      { questionId: 'uuid-1', answer: 'Option 1' },
      { questionId: 'uuid-2', answer: 'Option 2' },
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  responses: QuestionAnswerDto[];
}


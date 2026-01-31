import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuestionDto {
  @ApiProperty({
    description: 'Lesson Question ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Lesson Question ID must be a valid UUID' })
  @IsNotEmpty()
  lessonQuestionId: string;

  @ApiProperty({
    description: 'Answer provided by the vaccinator (structure varies by question type)',
    example: { answer: 'Paris' },
  })
  @IsNotEmpty()
  answer: any;
}


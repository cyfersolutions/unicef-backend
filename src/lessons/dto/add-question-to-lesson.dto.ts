import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddQuestionToLessonDto {
  @ApiProperty({
    description: 'Question ID to add to the lesson',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Question ID must be a valid UUID' })
  questionId: string;

  @ApiProperty({
    description: 'Order number for the question within the lesson',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'Order number must be an integer' })
  @Min(1, { message: 'Order number must be at least 1' })
  orderNo: number;
}


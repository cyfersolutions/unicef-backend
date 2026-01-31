import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  IsObject,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../common/enums/question-type.enum';

export class CreateQuestionDto {

  @ApiProperty({
    description: 'Type of question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionType, { message: 'Question type must be a valid QuestionType enum value' })
  questionType: QuestionType;

  @ApiProperty({
    description: 'Question text',
    example: 'What is the capital of France?',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Question text must be a string' })
  questionText?: string | null;

  @ApiProperty({
    description: 'URL to question image (for image-based questions)',
    example: 'https://example.com/question-image.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Question image URL must be a string' })
  questionImageUrl?: string | null;

  @ApiProperty({
    description: 'URL to question audio (for audio-based questions)',
    example: 'https://example.com/question-audio.mp3',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Question audio URL must be a string' })
  questionAudioUrl?: string | null;

  @ApiProperty({
    description: 'Question options as JSON (structure varies by question type)',
    example: {
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
      ],
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Options must be an object' })
  options?: any;

  @ApiProperty({
    description: 'Correct answer as JSON (structure varies by question type)',
    example: { correctAnswer: 'a' },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Correct answer must be an object' })
  correctAnswer?: any;

  @ApiProperty({
    description: 'Points awarded for this question',
    example: 10,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Points must be an integer' })
  @Min(1, { message: 'Points must be at least 1' })
  points?: number;

  @ApiProperty({
    description: 'XP awarded for this question',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'XP must be an integer' })
  @Min(0, { message: 'XP must be at least 0' })
  xp?: number | null;


  @ApiProperty({
    description: 'Lesson ID to add this question to (optional - if provided, question will be added to the lesson)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Lesson ID must be a valid UUID' })
  lessonId?: string | null;

  @ApiProperty({
    description: 'Order number within the lesson (required if lessonId is provided)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Order number must be an integer' })
  @Min(1, { message: 'Order number must be at least 1' })
  orderNo?: number | null;

  @ApiProperty({
    description: 'Persona ID linked to this question',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Persona ID must be a valid UUID' })
  personaId?: string | null;

  @ApiProperty({
    description: 'Whether the question is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}


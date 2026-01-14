import {
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    description: 'Title of the persona',
    example: 'Dr. Sarah - Medical Expert',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  title: string;

  @ApiProperty({
    description: 'Category of the persona',
    example: 'Medical',
  })
  @IsString({ message: 'Category must be a string' })
  @MinLength(1, { message: 'Category must be at least 1 character long' })
  category: string;

  @ApiProperty({
    description: 'URL to the persona image',
    example: 'https://example.com/persona-image.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'URL to the persona voice file',
    example: 'https://example.com/persona-voice.mp3',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Voice URL must be a string' })
  voiceUrl?: string | null;
}


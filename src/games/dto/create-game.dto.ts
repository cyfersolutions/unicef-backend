import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ description: 'Game title', example: 'Memory Match Game' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Game description', required: false, example: 'A fun memory matching game' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ description: 'Game URL', required: false, example: 'https://example.com/game' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string | null;

  @ApiProperty({ description: 'Whether the game is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


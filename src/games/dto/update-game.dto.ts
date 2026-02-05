import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateGameDto {
  @ApiProperty({ description: 'Game title', required: false, example: 'Memory Match Game' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'Game description', required: false, example: 'A fun memory matching game' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ description: 'Game URL', required: false, example: 'https://example.com/game' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string | null;

  @ApiProperty({ description: 'Whether the game is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


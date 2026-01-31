import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsNumber, IsOptional, IsBoolean, IsObject, Min, Max } from 'class-validator';

export class SubmitGameProgressDto {
  @ApiProperty({ description: 'Unit Game UUID' })
  @IsUUID()
  unitGameId: string;

  @ApiProperty({ description: 'Vaccinator UUID' })
  @IsUUID()
  vaccinatorId: string;

  @ApiProperty({ description: 'Game score', minimum: 0 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Attempt number', minimum: 1 })
  @IsInt()
  @Min(1)
  attempt: number;

  @ApiProperty({ description: 'Game ratings (1-5)', required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratings?: number | null;

  @ApiProperty({ description: 'Additional fields as JSON object', required: false, type: Object })
  @IsOptional()
  @IsObject()
  otherFields?: Record<string, any> | null;

  @ApiProperty({ description: 'Whether the game was passed' })
  @IsBoolean()
  isPassed: boolean;
}


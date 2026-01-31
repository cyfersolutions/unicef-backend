import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetStatisticsDto {
  @ApiPropertyOptional({ description: 'Start date (ISO string)', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO string)', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}


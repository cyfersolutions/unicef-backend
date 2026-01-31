import { IsOptional, IsEnum, IsString, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, HttpMethod } from '../entities/audit-log.entity';

export class FindAllAuditLogsDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 50, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID', example: 'uuid' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by user email', example: 'admin@example.com' })
  @IsString()
  @IsOptional()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Filter by user role', example: 'admin' })
  @IsString()
  @IsOptional()
  userRole?: string;

  @ApiPropertyOptional({ description: 'Filter by action', enum: AuditAction })
  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Filter by HTTP method', enum: HttpMethod })
  @IsEnum(HttpMethod)
  @IsOptional()
  method?: HttpMethod;

  @ApiPropertyOptional({ description: 'Filter by endpoint', example: '/api/users/vaccinators' })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'Filter by status code', example: 200 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  statusCode?: number;

  @ApiPropertyOptional({ description: 'Start date (ISO string)', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO string)', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search in endpoint, email, or error', example: 'vaccinator' })
  @IsString()
  @IsOptional()
  search?: string;
}


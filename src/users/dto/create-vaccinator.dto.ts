import { IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePersonalInfoDto } from './create-personal-info.dto';

export class CreateVaccinatorDto extends CreatePersonalInfoDto {
  @ApiPropertyOptional({ description: 'Supervisor ID', example: 'uuid' })
  @IsUUID()
  @IsOptional()
  supervisorId?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePersonalInfoDto } from './create-personal-info.dto';

export class CreateSupervisorDto extends CreatePersonalInfoDto {
  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class NeirCallbackDto {
  @ApiProperty({ description: 'Session ID from NEIR SSO' })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ description: 'User token from NEIR SSO' })
  @IsString()
  @IsNotEmpty()
  neir_token: string;

  @ApiProperty({ description: 'User role from NEIR SSO', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['vaccinator', 'supervisor'])
  role?: 'vaccinator' | 'supervisor';
}


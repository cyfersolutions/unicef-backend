import { IsEmail, IsString, IsInt, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleExists } from '../../common/validators/role-exists.validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin name',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Role ID (optional)',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Role ID must be an integer' })
  @RoleExists({ message: 'Role with this ID does not exist' })
  roleId?: number;
}

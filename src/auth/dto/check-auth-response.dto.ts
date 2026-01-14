import { ApiProperty } from '@nestjs/swagger';

export class CheckAuthResponseDto {
  @ApiProperty({
    description: 'Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Admin name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Admin role',
    example: 'admin',
    required: false,
  })
  role?: string;
}


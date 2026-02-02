import { ApiProperty } from '@nestjs/swagger';

export class AuthProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: 'vaccinator' | 'supervisor';

  @ApiProperty({ required: false })
  cnic?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  province?: string;

  @ApiProperty({ required: false })
  designation?: string;

  @ApiProperty({ required: false })
  completed?: boolean;
}


import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'HTML content of the certificate',
    example: '<div><h1>Certificate of Completion</h1><p>This is to certify that...</p></div>',
  })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({
    description: 'URL to the certificate image',
    example: 'https://example.com/certificate-image.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'Whether the certificate is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

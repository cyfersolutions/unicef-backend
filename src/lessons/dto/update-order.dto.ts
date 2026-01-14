import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'New order number',
    example: 2,
    minimum: 1,
  })
  @IsInt({ message: 'Order number must be an integer' })
  @Min(1, { message: 'Order number must be at least 1' })
  orderNo: number;
}


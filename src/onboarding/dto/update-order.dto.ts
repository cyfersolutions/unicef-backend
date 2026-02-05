import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ description: 'Order number', example: 1 })
  @IsInt()
  @Min(1)
  orderNo: number;
}


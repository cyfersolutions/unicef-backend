import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AssignGameToUnitLessonDto {
  @ApiProperty({ description: 'Game UUID' })
  @IsUUID()
  gameId: string;

  @ApiProperty({ description: 'Unit UUID' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Lesson UUID' })
  @IsUUID()
  lessonId: string;

  @ApiProperty({ description: 'Passing score for the game', example: 70, minimum: 0 })
  @IsInt()
  @Min(0)
  passingScore: number;
}


import { PartialType } from '@nestjs/swagger';
import { CreateDailyPracticeDto } from './create-daily-practice.dto';

export class UpdateDailyPracticeDto extends PartialType(CreateDailyPracticeDto) {}

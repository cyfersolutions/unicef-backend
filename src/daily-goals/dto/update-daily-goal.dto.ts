import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyGoalDto } from './create-daily-goal.dto';

export class UpdateDailyGoalDto extends PartialType(CreateDailyGoalDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateVaccinatorDto } from './create-vaccinator.dto';

export class UpdateVaccinatorDto extends PartialType(CreateVaccinatorDto) {}


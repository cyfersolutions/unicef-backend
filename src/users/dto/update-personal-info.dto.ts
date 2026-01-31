import { PartialType } from '@nestjs/swagger';
import { CreatePersonalInfoDto } from './create-personal-info.dto';

export class UpdatePersonalInfoDto extends PartialType(CreatePersonalInfoDto) {}


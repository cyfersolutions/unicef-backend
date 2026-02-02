import { PartialType } from '@nestjs/mapped-types';
import { CreateOnboardingQuestionDto } from './create-onboarding-question.dto';

export class UpdateOnboardingQuestionDto extends PartialType(CreateOnboardingQuestionDto) {}


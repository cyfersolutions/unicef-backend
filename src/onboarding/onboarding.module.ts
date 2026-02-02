import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingQuestion } from './entities/onboarding-question.entity';
import { OnboardingQuestionResponse } from './entities/onboarding-question-response.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingQuestion, OnboardingQuestionResponse, Vaccinator])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}


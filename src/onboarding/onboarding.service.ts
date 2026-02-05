import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingQuestion } from './entities/onboarding-question.entity';
import { OnboardingQuestionResponse } from './entities/onboarding-question-response.entity';
import { CreateOnboardingQuestionDto } from './dto/create-onboarding-question.dto';
import { UpdateOnboardingQuestionDto } from './dto/update-onboarding-question.dto';
import { SubmitOnboardingResponseDto } from './dto/submit-onboarding-response.dto';
import { SubmitOnboardingResponsesDto } from './dto/submit-onboarding-responses.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingQuestion)
    private onboardingQuestionRepository: Repository<OnboardingQuestion>,
    @InjectRepository(OnboardingQuestionResponse)
    private onboardingQuestionResponseRepository: Repository<OnboardingQuestionResponse>,
  ) {}

  async create(createOnboardingQuestionDto: CreateOnboardingQuestionDto): Promise<OnboardingQuestion> {
    const question = this.onboardingQuestionRepository.create(createOnboardingQuestionDto);
    return await this.onboardingQuestionRepository.save(question);
  }

  async findAll(): Promise<OnboardingQuestion[]> {
    return await this.onboardingQuestionRepository.find({
      where: { isActive: true },
      order: { orderNo: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<OnboardingQuestion[]> {
    return await this.onboardingQuestionRepository.find({
      order: { orderNo: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OnboardingQuestion> {
    const question = await this.onboardingQuestionRepository.findOne({
      where: { id },
      relations: ['responses'],
    });

    if (!question) {
      throw new NotFoundException(`Onboarding question with ID ${id} not found`);
    }

    return question;
  }

  async update(id: string, updateOnboardingQuestionDto: UpdateOnboardingQuestionDto): Promise<OnboardingQuestion> {
    const question = await this.findOne(id);
    await this.onboardingQuestionRepository.update(id, updateOnboardingQuestionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.onboardingQuestionRepository.remove(question);
  }

  async updateOrder(id: string, orderNo: number): Promise<OnboardingQuestion> {
    const question = await this.findOne(id);
    question.orderNo = orderNo;
    return await this.onboardingQuestionRepository.save(question);
  }

  async submitResponse(
    submitResponseDto: SubmitOnboardingResponseDto,
    vaccinatorId: string,
  ): Promise<OnboardingQuestionResponse> {
    // Verify question exists
    const question = await this.onboardingQuestionRepository.findOne({
      where: { id: submitResponseDto.questionId },
    });

    if (!question) {
      throw new NotFoundException(`Onboarding question with ID ${submitResponseDto.questionId} not found`);
    }

    // Verify answer is one of the valid options
    if (!question.options.includes(submitResponseDto.answer)) {
      throw new BadRequestException('Answer must be one of the valid options');
    }

    // Check if vaccinator already answered this question
    const existingResponse = await this.onboardingQuestionResponseRepository.findOne({
      where: {
        questionId: submitResponseDto.questionId,
        vaccinatorId,
      },
    });

    if (existingResponse) {
      // Update existing response
      existingResponse.answer = submitResponseDto.answer;
      existingResponse.datetime = submitResponseDto.datetime
        ? new Date(submitResponseDto.datetime)
        : new Date();
      return await this.onboardingQuestionResponseRepository.save(existingResponse);
    }

    // Create new response
    const response = this.onboardingQuestionResponseRepository.create({
      questionId: submitResponseDto.questionId,
      vaccinatorId,
      answer: submitResponseDto.answer,
      datetime: submitResponseDto.datetime ? new Date(submitResponseDto.datetime) : new Date(),
    });

    return await this.onboardingQuestionResponseRepository.save(response);
  }

  async getVaccinatorResponses(vaccinatorId: string): Promise<OnboardingQuestionResponse[]> {
    return await this.onboardingQuestionResponseRepository.find({
      where: { vaccinatorId },
      relations: ['question'],
      order: { createdAt: 'DESC' },
    });
  }

  async submitResponses(
    submitResponsesDto: SubmitOnboardingResponsesDto,
    vaccinatorId: string,
  ): Promise<OnboardingQuestionResponse[]> {
    const savedResponses: OnboardingQuestionResponse[] = [];

    // Process each response
    for (const responseDto of submitResponsesDto.responses) {
      // Verify question exists
      const question = await this.onboardingQuestionRepository.findOne({
        where: { id: responseDto.questionId },
      });

      if (!question) {
        throw new NotFoundException(`Onboarding question with ID ${responseDto.questionId} not found`);
      }

      // Verify answer is one of the valid options
      if (!question.options.includes(responseDto.answer)) {
        throw new BadRequestException(
          `Answer "${responseDto.answer}" is not a valid option for question ${responseDto.questionId}`,
        );
      }

      // Check if vaccinator already answered this question
      const existingResponse = await this.onboardingQuestionResponseRepository.findOne({
        where: {
          questionId: responseDto.questionId,
          vaccinatorId,
        },
      });

      const responseDatetime = responseDto.datetime ? new Date(responseDto.datetime) : new Date();

      if (existingResponse) {
        // Update existing response
        existingResponse.answer = responseDto.answer;
        existingResponse.datetime = responseDatetime;
        const saved = await this.onboardingQuestionResponseRepository.save(existingResponse);
        savedResponses.push(saved);
      } else {
        // Create new response
        const response = this.onboardingQuestionResponseRepository.create({
          questionId: responseDto.questionId,
          vaccinatorId,
          answer: responseDto.answer,
          datetime: responseDatetime,
        });
        const saved = await this.onboardingQuestionResponseRepository.save(response);
        savedResponses.push(saved);
      }
    }

    return savedResponses;
  }
}


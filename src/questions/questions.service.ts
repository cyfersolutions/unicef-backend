import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // If lessonId and orderNo are provided, check for uniqueness
    if (createQuestionDto.lessonId && createQuestionDto.orderNo !== null && createQuestionDto.orderNo !== undefined) {
      const existing = await this.questionRepository.findOne({
        where: {
          lessonId: createQuestionDto.lessonId,
          orderNo: createQuestionDto.orderNo,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Question with order number ${createQuestionDto.orderNo} already exists for this lesson`,
        );
      }
    }

    const question = this.questionRepository.create(createQuestionDto);
    return await this.questionRepository.save(question);
  }

  async findAll() {
    return await this.questionRepository.find({
      relations: ['lesson', 'persona'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLessonId(lessonId: string) {
    return await this.questionRepository.find({
      where: { lessonId },
      relations: ['persona'],
      order: { orderNo: 'ASC' },
    });
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['lesson', 'persona'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    // If lessonId and orderNo are being updated, check for uniqueness
    if (updateQuestionDto.lessonId && updateQuestionDto.orderNo !== null && updateQuestionDto.orderNo !== undefined) {
      const existing = await this.questionRepository.findOne({
        where: {
          lessonId: updateQuestionDto.lessonId,
          orderNo: updateQuestionDto.orderNo,
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Question with order number ${updateQuestionDto.orderNo} already exists for this lesson`,
        );
      }
    }

    await this.questionRepository.update(id, updateQuestionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.questionRepository.delete(id);
    return { message: 'Question deleted successfully' };
  }
}


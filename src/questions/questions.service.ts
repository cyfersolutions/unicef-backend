import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(LessonQuestion)
    private lessonQuestionRepository: Repository<LessonQuestion>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // Extract lessonId and orderNo before creating question
    const { lessonId, orderNo, ...questionData } = createQuestionDto;

    // Create the question
    const question = this.questionRepository.create(questionData);
    const savedQuestion = await this.questionRepository.save(question);

    // If lessonId is provided, create the lesson_question relationship
    if (lessonId) {
      // Validate that lesson exists
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId },
      });

      if (!lesson) {
        throw new NotFoundException(`Lesson with id ${lessonId} not found`);
      }

      // Validate orderNo is provided when lessonId is provided
      if (orderNo === null || orderNo === undefined) {
        throw new BadRequestException('Order number is required when lessonId is provided');
      }

      // Check if question is already in this lesson
      const existing = await this.lessonQuestionRepository.findOne({
        where: { lessonId, questionId: savedQuestion.id },
      });

      if (existing) {
        throw new BadRequestException('Question is already added to this lesson');
      }

      // Check if orderNo already exists for this lesson
      const existingOrder = await this.lessonQuestionRepository.findOne({
        where: { lessonId, orderNo },
      });

      if (existingOrder) {
        throw new BadRequestException(`Order number ${orderNo} already exists for this lesson`);
      }

      // Create lesson_question relationship
      const lessonQuestion = this.lessonQuestionRepository.create({
        lessonId,
        questionId: savedQuestion.id,
        orderNo,
      });

      await this.lessonQuestionRepository.save(lessonQuestion);
    }

    return savedQuestion;
  }

  async findAll() {
    return await this.questionRepository.find({
      relations: ['persona'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    await this.questionRepository.update(id, updateQuestionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.questionRepository.delete(id);
    return { message: 'Question deleted successfully' };
  }
}


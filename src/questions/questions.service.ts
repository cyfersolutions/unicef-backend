import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    const questions = await this.questionRepository.find({
      relations: ['persona'],
      order: { createdAt: 'DESC' },
    });

    // Get all lesson_questions to find which lessons each question belongs to
    const questionIds = questions.map((q) => q.id);
    const lessonQuestions = questionIds.length > 0
      ? await this.lessonQuestionRepository.find({
          where: { questionId: In(questionIds) },
          relations: ['lesson'],
        })
      : [];

    // Create a map of questionId -> lessonQuestion (first one found)
    const questionLessonMap = new Map<string, { lessonId: string; lesson: Lesson }>();
    for (const lq of lessonQuestions) {
      if (!questionLessonMap.has(lq.questionId)) {
        questionLessonMap.set(lq.questionId, {
          lessonId: lq.lessonId,
          lesson: lq.lesson,
        });
      }
    }

    // Map questions with lesson information
    return questions.map((question) => {
      const lessonInfo = questionLessonMap.get(question.id);
      return {
        ...question,
        lessonId: lessonInfo?.lessonId || null,
        lesson: lessonInfo?.lesson || null,
      };
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
    const question = await this.findOne(id);
    Object.assign(question, updateQuestionDto);
    const updatedQuestion = await this.questionRepository.save(question);
    return this.findOne(updatedQuestion.id);
  }

  async remove(id: string) {
    await this.questionRepository.delete(id);
    return { message: 'Question deleted successfully' };
  }
}


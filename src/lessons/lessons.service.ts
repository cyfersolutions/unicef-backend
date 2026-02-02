import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonQuestion } from './entities/lesson-question.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { LessonQuestionProgress } from './entities/lesson-question-progress.entity';
import { Question } from '../questions/entities/question.entity';
import { Unit } from '../units/entities/unit.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonQuestion)
    private lessonQuestionRepository: Repository<LessonQuestion>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(LessonQuestionProgress)
    private lessonQuestionProgressRepository: Repository<LessonQuestionProgress>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  private async shiftOrderNumbers(unitId: string, targetOrderNo: number, excludeLessonId?: string) {
    await this.lessonRepository
      .createQueryBuilder()
      .update(Lesson)
      .set({ orderNo: () => 'order_no + 1' })
      .where('unit_id = :unitId', { unitId })
      .andWhere('order_no >= :targetOrderNo', { targetOrderNo })
      .andWhere(excludeLessonId ? 'id != :excludeLessonId' : '1=1', excludeLessonId ? { excludeLessonId } : {})
      .execute();
  }

  async create(createLessonDto: CreateLessonDto) {
    // Verify unit exists
    const unit = await this.unitRepository.findOne({
      where: { id: createLessonDto.unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with id ${createLessonDto.unitId} not found`);
    }

    // If orderNo is provided, shift existing lessons
    if (createLessonDto.orderNo !== undefined && createLessonDto.orderNo !== null) {
      await this.shiftOrderNumbers(createLessonDto.unitId, createLessonDto.orderNo);
    }

    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async findAll(unitId?: string, filters?: Record<string, any>) {
    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.unit', 'unit')
      .loadRelationCountAndMap('lesson.totalQuestions', 'lesson.lessonQuestions')
      .orderBy('lesson.order_no', 'ASC')
      .addOrderBy('lesson.created_at', 'DESC');

    // Filter by unitId if provided
    if (unitId) {
      queryBuilder.andWhere('lesson.unit_id = :unitId', { unitId });
    }

    // Apply dynamic filters from query parameters
    if (filters) {

      //filter by module 
      if (filters.moduleId) {
        queryBuilder.andWhere('unit.module_id = :moduleId', { moduleId: filters.moduleId });
      }

      // Filter by unit id
      if (filters.unitId) {
        queryBuilder.andWhere('lesson.unit_id = :unitId', { unitId: filters.unitId });
      }

      // Filter by title (case-insensitive partial match)
      if (filters.title) {
        queryBuilder.andWhere('lesson.title ILIKE :title', { title: `%${filters.title}%` });
      }
     
      // Filter by isActive
      if (filters.isActive !== undefined && filters.isActive !== null) {
        const isActive = filters.isActive === 'true' || filters.isActive === true;
        queryBuilder.andWhere('lesson.is_active = :isActive', { isActive });
      }
      // Filter by passThreshold
      if (filters.passThreshold !== undefined && filters.passThreshold !== null) {
        queryBuilder.andWhere('lesson.pass_threshold = :passThreshold', { passThreshold: filters.passThreshold });
      }
      // Filter by failedThreshold
      if (filters.failedThreshold !== undefined && filters.failedThreshold !== null) {
        queryBuilder.andWhere('lesson.failed_threshold = :failedThreshold', { failedThreshold: filters.failedThreshold });
      }
      // Filter by createdAt (date range)
      if (filters.createdAtFrom) {
        queryBuilder.andWhere('lesson.created_at >= :createdAtFrom', { createdAtFrom: filters.createdAtFrom });
      }
      if (filters.createdAtTo) {
        queryBuilder.andWhere('lesson.created_at <= :createdAtTo', { createdAtTo: filters.createdAtTo });
      }
    }

    const lessons = await queryBuilder.getMany();
    
    // Map results to include totalQuestions count (loadRelationCountAndMap adds it as a property)
    return lessons.map((lesson) => ({
      ...lesson,
      totalQuestions: (lesson as any).totalQuestions || 0,
    }));
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['unit', 'lessonQuestions', 'lessonQuestions.question', 'lessonQuestions.question.persona'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }

    return lesson;
  }

  async addQuestionToLesson(lessonId: string, questionId: string, orderNo: number) {
    // Verify lesson exists
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    // Verify question exists
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    // Check if question is already in this lesson
    const existing = await this.lessonQuestionRepository.findOne({
      where: { lessonId, questionId },
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

    const lessonQuestion = this.lessonQuestionRepository.create({
      lessonId,
      questionId,
      orderNo,
    });

    return await this.lessonQuestionRepository.save(lessonQuestion);
  }

  async removeQuestionFromLesson(lessonId: string, questionId: string) {
    const lessonQuestion = await this.lessonQuestionRepository.findOne({
      where: { lessonId, questionId },
    });

    if (!lessonQuestion) {
      throw new NotFoundException('Question is not associated with this lesson');
    }

    await this.lessonQuestionRepository.remove(lessonQuestion);
    return { message: 'Question removed from lesson successfully' };
  }

  async updateQuestionOrder(lessonId: string, questionId: string, orderNo: number) {
    const lessonQuestion = await this.lessonQuestionRepository.findOne({
      where: { lessonId, questionId },
    });

    if (!lessonQuestion) {
      throw new NotFoundException('Question is not associated with this lesson');
    }

    // Check if orderNo already exists for this lesson
    const existingOrder = await this.lessonQuestionRepository.findOne({
      where: { lessonId, orderNo },
    });
    if (existingOrder && existingOrder.id !== lessonQuestion.id) {
      throw new BadRequestException(`Order number ${orderNo} already exists for this lesson`);
    }

    lessonQuestion.orderNo = orderNo;
    return await this.lessonQuestionRepository.save(lessonQuestion);
  }

  async getLessonQuestions(lessonId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    return await this.lessonQuestionRepository.find({
      where: { lessonId },
      relations: ['question', 'question.persona'],
      order: { orderNo: 'ASC' },
    });
  }

  async getLessonQuestionsWithProgress(lessonId: string, vaccinatorId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    // Get all lesson questions with question details
    const lessonQuestions = await this.lessonQuestionRepository.find({
      where: { lessonId },
      relations: ['question', 'question.persona'],
      order: { orderNo: 'ASC' },
    });

    // Get all question progresses for this vaccinator and lesson
    const allQuestionProgresses = await this.lessonQuestionProgressRepository.find({
      where: { vaccinatorId },
      relations: ['lessonQuestion', 'lessonQuestion.lesson'],
    });

    // Filter question progresses for questions in this lesson
    const questionProgresses = allQuestionProgresses.filter(
      (progress) => progress.lessonQuestion.lessonId === lessonId,
    );

    // Group question progress by lessonQuestionId
    const questionProgressMap = new Map<string, LessonQuestionProgress>();
    for (const progress of questionProgresses) {
      const existing = questionProgressMap.get(progress.lessonQuestionId);
      if (!existing) {
        questionProgressMap.set(progress.lessonQuestionId, progress);
      } else {
        // Prefer isCompleted false, otherwise keep the existing one
        if (!progress.isCompleted && existing.isCompleted) {
          questionProgressMap.set(progress.lessonQuestionId, progress);
        } else if (progress.isCompleted && !existing.isCompleted) {
          // Keep existing (isCompleted false)
        } else {
          // Both same completion status, prefer the one with higher attempt number
          if (progress.attemptNumber > existing.attemptNumber) {
            questionProgressMap.set(progress.lessonQuestionId, progress);
          }
        }
      }
    }

    // Map lesson questions with progress and question details
    const questionsWithProgress = lessonQuestions.map((lessonQuestion) => {
      const progress = questionProgressMap.get(lessonQuestion.id);
      return {
        id: lessonQuestion.id,
        lessonId: lessonQuestion.lessonId,
        questionId: lessonQuestion.questionId,
        orderNo: lessonQuestion.orderNo,
        createdAt: lessonQuestion.createdAt,
        question: lessonQuestion.question, // Full question content
        answer: lessonQuestion.question?.correctAnswer || null, // Answer from question
        progress: progress || null,
        isLocked: !progress, // Locked if no progress exists
      };
    });

    return {
      questions: questionsWithProgress,
      totalQuestions: lessonQuestions.length,
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.findOne(id);
    const unitId = updateLessonDto.unitId || lesson.unitId;

    // If unitId is being changed, verify new unit exists
    if (updateLessonDto.unitId && updateLessonDto.unitId !== lesson.unitId) {
      const unit = await this.unitRepository.findOne({
        where: { id: updateLessonDto.unitId },
      });

      if (!unit) {
        throw new NotFoundException(`Unit with id ${updateLessonDto.unitId} not found`);
      }
    }

    // Handle order number changes
    if (updateLessonDto.orderNo !== undefined && updateLessonDto.orderNo !== null) {
      const oldOrderNo = lesson.orderNo;
      const newOrderNo = updateLessonDto.orderNo;
      const isChangingUnit = updateLessonDto.unitId && updateLessonDto.unitId !== lesson.unitId;

      if (isChangingUnit) {
        // Moving to different unit: shift in new unit, adjust old unit
        await this.shiftOrderNumbers(updateLessonDto.unitId!, newOrderNo, id);
        if (oldOrderNo !== null) {
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no - 1' })
            .where('unit_id = :unitId', { unitId: lesson.unitId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .execute();
        }
      } else if (oldOrderNo !== null && oldOrderNo !== newOrderNo) {
        // Same unit, reordering
        if (newOrderNo < oldOrderNo) {
          // Moving up: shift lessons between newOrderNo and oldOrderNo down
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no + 1' })
            .where('unit_id = :unitId', { unitId })
            .andWhere('order_no >= :newOrderNo', { newOrderNo })
            .andWhere('order_no < :oldOrderNo', { oldOrderNo })
            .andWhere('id != :lessonId', { lessonId: id })
            .execute();
        } else {
          // Moving down: shift lessons between oldOrderNo and newOrderNo up
          await this.lessonRepository
            .createQueryBuilder()
            .update(Lesson)
            .set({ orderNo: () => 'order_no - 1' })
            .where('unit_id = :unitId', { unitId })
            .andWhere('order_no > :oldOrderNo', { oldOrderNo })
            .andWhere('order_no <= :newOrderNo', { newOrderNo })
            .andWhere('id != :lessonId', { lessonId: id })
            .execute();
        }
      } else if (oldOrderNo === null) {
        // Lesson didn't have orderNo, shift existing ones
        await this.shiftOrderNumbers(unitId, newOrderNo, id);
      }
    }

    Object.assign(lesson, updateLessonDto);
    const updatedLesson = await this.lessonRepository.save(lesson);
    return this.findOne(updatedLesson.id);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const lesson = await this.findOne(id);
    return this.update(id, { orderNo: updateOrderDto.orderNo });
  }

  async remove(id: string) {
    const lesson = await this.findOne(id);
    const unitId = lesson.unitId;
    const orderNo = lesson.orderNo;

    await this.lessonRepository.delete(id);

    // Shift remaining lessons up
    if (orderNo !== null) {
      await this.lessonRepository
        .createQueryBuilder()
        .update(Lesson)
        .set({ orderNo: () => 'order_no - 1' })
        .where('unit_id = :unitId', { unitId })
        .andWhere('order_no > :orderNo', { orderNo })
        .execute();
    }

    return { message: 'Lesson deleted successfully' };
  }

  /**
   * Get the current question state for a lesson based on lesson progress
   * Returns the current question to answer, progress info, and total questions
   */
  async getCurrentQuestionState(lessonId: string, vaccinatorId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    // Get all lesson questions ordered
    const lessonQuestions = await this.lessonQuestionRepository.find({
      where: { lessonId },
      relations: ['question', 'question.persona'],
      order: { orderNo: 'ASC' },
    });

    const totalQuestions = lessonQuestions.length;

    // Get lesson progress for this vaccinator
    const lessonProgress = await this.lessonProgressRepository.findOne({
      where: { lessonId, vaccinatorId },
      order: { attemptNumber: 'DESC' },
    });

    // If no progress, return first question
    if (!lessonProgress) {
      const firstQuestion = lessonQuestions[0];
      return {
        currentQuestion: firstQuestion ? {
          id: firstQuestion.id,
          lessonId: firstQuestion.lessonId,
          questionId: firstQuestion.questionId,
          orderNo: firstQuestion.orderNo,
          question: firstQuestion.question,
        } : null,
        currentQuestionIndex: 0,
        totalQuestions,
        questionsCompleted: 0,
        isLessonCompleted: false,
        xpEarned: 0,
      };
    }

    // Lesson is completed
    if (lessonProgress.isCompleted) {
      return {
        currentQuestion: null,
        currentQuestionIndex: totalQuestions,
        totalQuestions,
        questionsCompleted: lessonProgress.questionsCompleted,
        isLessonCompleted: true,
        xpEarned: lessonProgress.xpEarned,
      };
    }

    // Find current question by currentQuestionId
    let currentQuestionIndex = 0;
    let currentQuestion = lessonQuestions[0];

    if (lessonProgress.currentQuestionId) {
      const foundIndex = lessonQuestions.findIndex(
        (lq) => lq.id === lessonProgress.currentQuestionId
      );
      if (foundIndex >= 0) {
        currentQuestionIndex = foundIndex;
        currentQuestion = lessonQuestions[foundIndex];
      }
    }

    return {
      currentQuestion: currentQuestion ? {
        id: currentQuestion.id,
        lessonId: currentQuestion.lessonId,
        questionId: currentQuestion.questionId,
        orderNo: currentQuestion.orderNo,
        question: currentQuestion.question,
      } : null,
      currentQuestionIndex,
      totalQuestions,
      questionsCompleted: lessonProgress.questionsCompleted,
      isLessonCompleted: false,
      xpEarned: lessonProgress.xpEarned,
    };
  }

  /**
   * Get the next question after the current one
   */
  async getNextQuestion(lessonId: string, currentLessonQuestionId: string) {
    // Get all lesson questions ordered
    const lessonQuestions = await this.lessonQuestionRepository.find({
      where: { lessonId },
      relations: ['question', 'question.persona'],
      order: { orderNo: 'ASC' },
    });

    const currentIndex = lessonQuestions.findIndex(
      (lq) => lq.id === currentLessonQuestionId
    );

    // If not found or is last question, return null
    if (currentIndex === -1 || currentIndex >= lessonQuestions.length - 1) {
      return {
        nextQuestion: null,
        isLastQuestion: true,
        nextQuestionIndex: lessonQuestions.length,
        totalQuestions: lessonQuestions.length,
      };
    }

    const nextQuestion = lessonQuestions[currentIndex + 1];
    return {
      nextQuestion: {
        id: nextQuestion.id,
        lessonId: nextQuestion.lessonId,
        questionId: nextQuestion.questionId,
        orderNo: nextQuestion.orderNo,
        question: nextQuestion.question,
      },
      isLastQuestion: currentIndex + 1 >= lessonQuestions.length - 1,
      nextQuestionIndex: currentIndex + 1,
      totalQuestions: lessonQuestions.length,
    };
  }
}


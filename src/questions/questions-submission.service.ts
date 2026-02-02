import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { QueueService } from '../queue/queue.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { LessonsService } from '../lessons/lessons.service';

@Injectable()
export class QuestionsSubmissionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(LessonQuestion)
    private lessonQuestionRepository: Repository<LessonQuestion>,
    private queueService: QueueService,
    @Inject(forwardRef(() => LessonsService))
    private lessonsService: LessonsService,
  ) {}

  async submitQuestion(submitQuestionDto: SubmitQuestionDto, vaccinatorId: string) {
    const { lessonQuestionId, answer } = submitQuestionDto;

    // Get lesson question with question details
    const lessonQuestion = await this.lessonQuestionRepository.findOne({
      where: { id: lessonQuestionId },
      relations: ['question'],
    });

    if (!lessonQuestion) {
      throw new NotFoundException(`Lesson question with id ${lessonQuestionId} not found`);
    }

    const question = lessonQuestion.question;

    // Check if answer is correct
    const isCorrect = this.checkAnswer(question, answer);

    // Get question XP
    const questionXp = question.xp || 0;

    // Push to queue
    const job = await this.queueService.addQuestionSubmission({
      lessonQuestionId,
      vaccinatorId,
      answer,
      questionId: question.id,
      questionXp,
      isCorrect,
      timestamp: new Date(),
    });

    // Get the next question
    const nextQuestionData = await this.lessonsService.getNextQuestion(
      lessonQuestion.lessonId,
      lessonQuestionId
    );

    return {
      jobId: job.id,
      isCorrect,
      questionXp,
      message: 'Question submitted successfully. Processing in background.',
      nextQuestion: nextQuestionData.nextQuestion,
      isLastQuestion: nextQuestionData.isLastQuestion,
      nextQuestionIndex: nextQuestionData.nextQuestionIndex,
      totalQuestions: nextQuestionData.totalQuestions,
    };
  }

  private checkAnswer(question: Question, answer: any): boolean {
    // Simple answer checking logic - you may need to expand this based on question types
    if (!question.correctAnswer) {
      return false;
    }

    // For simple answers
    if (typeof question.correctAnswer === 'string' || typeof question.correctAnswer === 'number') {
      return question.correctAnswer === answer;
    }

    // For complex answers (JSON)
    if (typeof question.correctAnswer === 'object') {
      return JSON.stringify(question.correctAnswer) === JSON.stringify(answer);
    }

    return false;
  }
}


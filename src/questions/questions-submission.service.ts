import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { QueueService } from '../queue/queue.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { LessonsService } from '../lessons/lessons.service';
import { ProgressUpdateService } from '../rewards/progress-update.service';

@Injectable()
export class QuestionsSubmissionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(LessonQuestion)
    private lessonQuestionRepository: Repository<LessonQuestion>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    private queueService: QueueService,
    @Inject(forwardRef(() => LessonsService))
    private lessonsService: LessonsService,
    private progressUpdateService: ProgressUpdateService,
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

    // Debug logging
    console.log('Question type:', question.questionType);
    console.log('Correct answer from DB:', JSON.stringify(question.correctAnswer));
    console.log('User answer:', JSON.stringify(answer));

    // Check if answer is correct
    const isCorrect = this.checkAnswer(question, answer);
    
    console.log('Is correct:', isCorrect);

    // Get question XP
    const questionXp = question.xp || 0;

    // Update progress directly (queue commented out for now)
    // const job = await this.queueService.addQuestionSubmission({
    //   lessonQuestionId,
    //   vaccinatorId,
    //   answer,
    //   questionId: question.id,
    //   questionXp,
    //   isCorrect,
    //   timestamp: new Date(),
    // });

    // Update progress directly instead of using queue
    await this.progressUpdateService.updateProgress({
      lessonQuestionId,
      vaccinatorId,
      questionXp,
      isCorrect,
      timestamp: new Date(),
    });

    // Get updated lesson progress to get questionsCompleted count and completion status
    const lessonProgress = await this.lessonProgressRepository.findOne({
      where: {
        lessonId: lessonQuestion.lessonId,
        vaccinatorId,
        attemptNumber: 1,
      },
    });

    // Get the next question
    const nextQuestionData = await this.lessonsService.getNextQuestion(
      lessonQuestion.lessonId,
      lessonQuestionId
    );

    return {
      // jobId: job.id,
      isCorrect,
      questionXp,
      message: 'Question submitted successfully.',
      nextQuestion: nextQuestionData.nextQuestion,
      isLastQuestion: nextQuestionData.isLastQuestion,
      nextQuestionIndex: nextQuestionData.nextQuestionIndex,
      totalQuestions: nextQuestionData.totalQuestions,
      questionsCompleted: lessonProgress?.questionsCompleted || 0,
      isLessonCompleted: lessonProgress?.isCompleted || false,
    };
  }

  private checkAnswer(question: Question, answer: any): boolean {
    // Simple answer checking logic - you may need to expand this based on question types
    if (!question.correctAnswer) {
      return false;
    }

    // For MATCH_THE_COLUMN questions
    if (question.questionType === 'MATCH_THE_COLUMN') {
      const correctPairs: Array<{ leftId: string; rightId: string }> = question.correctAnswer?.pairs || [];
      const userPairs: Array<{ leftId: string; rightId: string }> = answer?.pairs || [];

      // Check if all pairs match
      if (userPairs.length !== correctPairs.length) {
        return false;
      }

      // Check if all pairs are correct
      return correctPairs.every(correctPair => {
        const userPair = userPairs.find(
          (p) => p.leftId?.toLowerCase() === correctPair.leftId?.toLowerCase()
        );
        return userPair?.rightId?.toLowerCase() === correctPair.rightId?.toLowerCase();
      });
    }

    // For TAP_SELECT questions (array of selected IDs)
    if (question.questionType === 'TAP_SELECT' && Array.isArray(answer)) {
      const correctAnswers: string[] = question.correctAnswer?.correctAnswers || [];
      
      if (answer.length !== correctAnswers.length) {
        return false;
      }

      const answerSet = new Set(answer.map((id: string) => id.toLowerCase()));
      const correctSet = new Set(correctAnswers.map((id: string) => id.toLowerCase()));

      return [...answerSet].every(id => correctSet.has(id)) && 
             [...correctSet].every(id => answerSet.has(id));
    }

    // For MULTIPLE_CHOICE and other single-answer questions
    // correctAnswer is stored as JSON object like { "correctAnswer": "a" }
    // but user sends just the option ID like "a"
    if (typeof question.correctAnswer === 'object' && question.correctAnswer !== null) {
      // Check if correctAnswer has a 'correctAnswer' property (for MULTIPLE_CHOICE)
      if ('correctAnswer' in question.correctAnswer) {
        const correctAnswerValue = question.correctAnswer.correctAnswer;
        // Compare case-insensitively
        return String(correctAnswerValue).toLowerCase() === String(answer).toLowerCase();
      }
      
      // Check if correctAnswer has 'correctAnswers' array (for TAP_SELECT fallback)
      if ('correctAnswers' in question.correctAnswer && Array.isArray(question.correctAnswer.correctAnswers)) {
        const correctAnswers: string[] = question.correctAnswer.correctAnswers;
        if (Array.isArray(answer)) {
          const answerSet = new Set(answer.map((id: string) => String(id).toLowerCase()));
          const correctSet = new Set(correctAnswers.map((id: string) => String(id).toLowerCase()));
          return [...answerSet].every(id => correctSet.has(id)) && 
                 [...correctSet].every(id => answerSet.has(id));
        }
        return false;
      }
      
      // Check if correctAnswer has 'pairs' array (for MATCH_THE_COLUMN fallback)
      if ('pairs' in question.correctAnswer && Array.isArray(question.correctAnswer.pairs)) {
        const correctPairs: Array<{ leftId: string; rightId: string }> = question.correctAnswer.pairs;
        const userPairs: Array<{ leftId: string; rightId: string }> = answer?.pairs || [];
        if (userPairs.length !== correctPairs.length) {
          return false;
        }
        return correctPairs.every(correctPair => {
          const userPair = userPairs.find(
            (p) => String(p.leftId).toLowerCase() === String(correctPair.leftId).toLowerCase()
          );
          return userPair && String(userPair.rightId).toLowerCase() === String(correctPair.rightId).toLowerCase();
        });
      }
      
      // Fallback: compare JSON strings
      return JSON.stringify(question.correctAnswer) === JSON.stringify(answer);
    }

    // For simple answers (string or number)
    if (typeof question.correctAnswer === 'string' || typeof question.correctAnswer === 'number') {
      return String(question.correctAnswer).toLowerCase() === String(answer).toLowerCase();
    }

    return false;
  }
}


import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsSubmissionService } from './questions-submission.service';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { WrongQuestion } from './entities/wrong-question.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { QueueModule } from '../queue/queue.module';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, WrongQuestion, LessonQuestion, Lesson, Vaccinator]),
    QueueModule,
    forwardRef(() => LessonsModule),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsSubmissionService],
  exports: [QuestionsService],
})
export class QuestionsModule {}


import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsSubmissionService } from './questions-submission.service';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { WrongQuestion } from './entities/wrong-question.entity';
import { LessonQuestion } from '../lessons/entities/lesson-question.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { QueueModule } from '../queue/queue.module';
import { LessonsModule } from '../lessons/lessons.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, WrongQuestion, LessonQuestion, LessonProgress, Lesson, Vaccinator]),
    QueueModule,
    forwardRef(() => LessonsModule),
    RewardsModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsSubmissionService],
  exports: [QuestionsService],
})
export class QuestionsModule {}


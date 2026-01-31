import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity';
import { LessonQuestion } from './entities/lesson-question.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { LessonQuestionProgress } from './entities/lesson-question-progress.entity';
import { Unit } from '../units/entities/unit.entity';
import { Question } from '../questions/entities/question.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';

@NestModule({
  imports: [TypeOrmModule.forFeature([Lesson, LessonQuestion, LessonProgress, LessonQuestionProgress, Unit, Question, Vaccinator])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}


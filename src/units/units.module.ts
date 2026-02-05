import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from './entities/unit.entity';
import { UnitProgress } from './entities/unit-progress.entity';
import { Module } from '../modules/entities/module.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LessonsModule } from '../lessons/lessons.module';
import { LessonProgress } from 'src/lessons/entities/lesson-progress.entity';
import { Game } from 'src/games/entities/game.entity';
import { UnitGame } from 'src/games/entities/unit-game.entity';
import { VaccinatorUnitGameProgress } from 'src/games/entities/vaccinator-unit-game-progress.entity';

@NestModule({
  imports: [TypeOrmModule.forFeature([Unit, UnitProgress, Module, Vaccinator, Lesson, LessonProgress, Game, UnitGame, VaccinatorUnitGameProgress]), LessonsModule],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UnitGame } from './entities/unit-game.entity';
import { VaccinatorUnitGameProgress } from './entities/vaccinator-unit-game-progress.entity';
import { Unit } from '../units/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Game,
      UnitGame,
      VaccinatorUnitGameProgress,
      Unit,
      Lesson,
      Vaccinator,
      UnitProgress,
      LessonProgress,
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService], // Only export providers/services, not entities
})
export class GamesModule {}


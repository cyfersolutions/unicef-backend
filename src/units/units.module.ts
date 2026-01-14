import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from './entities/unit.entity';
import { Module } from '../modules/entities/module.entity';
import { LessonsModule } from '../lessons/lessons.module';

@NestModule({
  imports: [TypeOrmModule.forFeature([Unit, Module]), LessonsModule],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}

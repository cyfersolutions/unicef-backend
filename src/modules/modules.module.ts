import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { Module } from './entities/module.entity';
import { ModuleProgress } from './entities/module-progress.entity';
import { UnitsModule } from '../units/units.module';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { Unit } from '../units/entities/unit.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { VaccinatorSummary } from '../users/entities/vaccinator-summary.entity';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module, ModuleProgress, Vaccinator, Unit, UnitProgress, VaccinatorSummary]), UnitsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}

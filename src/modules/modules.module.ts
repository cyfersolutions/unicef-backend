import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { Module } from './entities/module.entity';
import { UnitsModule } from '../units/units.module';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module]), UnitsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}

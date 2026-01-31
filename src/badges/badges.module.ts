import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { Badge } from './entities/badge.entity';
import { VaccinatorBadge } from './entities/vaccinator-badge.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';

@NestModule({
  imports: [TypeOrmModule.forFeature([Badge, VaccinatorBadge, Vaccinator])],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}

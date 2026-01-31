import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PersonalInfo } from './entities/personal-info.entity';
import { Vaccinator } from './entities/vaccinator.entity';
import { Supervisor } from './entities/supervisor.entity';
import { VaccinatorSummary } from './entities/vaccinator-summary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonalInfo, Vaccinator, Supervisor, VaccinatorSummary]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}


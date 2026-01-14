import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../admins/entities/role.entity';
import { RoleExistsConstraint } from './role-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleExistsConstraint],
  exports: [RoleExistsConstraint],
})
export class ValidatorsModule {}


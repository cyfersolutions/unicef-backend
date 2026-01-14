import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../admins/entities/role.entity';

@ValidatorConstraint({ name: 'RoleExists', async: true })
@Injectable()
export class RoleExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validate(roleId: number, args: ValidationArguments): Promise<boolean> {
    if (!roleId) {
      return true; // Optional field, skip if not provided
    }
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    return !!role;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Role with id ${args.value} does not exist`;
  }
}

export function RoleExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RoleExistsConstraint,
    });
  };
}


import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Role } from './entities/role.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AddAdminDto } from '../auth/dto/add-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const randomPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const newAdmin = this.adminRepository.create({
      ...createAdminDto,
      passwordHash,
      isActive: true,
    });

    const savedAdmin = await this.adminRepository.save(newAdmin);

    return {
      id: savedAdmin.id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      roleId: savedAdmin.roleId,
      password: randomPassword,
    };
  }

  findAll() {
    return this.adminRepository.find({
      relations: ['role'],
    });
  }

  findOne(id: string) {
    return this.adminRepository.findOne({
      where: { id },
      relations: ['role', 'adminPermissions', 'adminPermissions.permission'],
    });
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    await this.adminRepository.update(id, updateAdminDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.adminRepository.delete(id);
    return { message: 'Admin deleted successfully' };
  }

  async addAdmin(addAdminDto: AddAdminDto, currentAdmin: Admin) {
    const currentAdminRole = await this.roleRepository.findOne({
      where: { id: currentAdmin.roleId },
    });

    if (currentAdminRole?.name !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can add admins');
    }

    const role = await this.roleRepository.findOne({
      where: { id: addAdminDto.role },
    });

    if (!role) {
      throw new ForbiddenException(`Role with id ${addAdminDto.role} does not exist`);
    }

    // Ensure only admin or superadmin roles can be assigned
    if (role.name !== 'admin' && role.name !== 'superadmin') {
      throw new ForbiddenException('Can only assign admin or superadmin roles');
    }

    const existingAdmin = await this.adminRepository.findOne({
      where: { email: addAdminDto.email },
    });

    if (existingAdmin) {
      throw new ForbiddenException('Admin with this email already exists');
    }

    const randomPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const newAdmin = this.adminRepository.create({
      name: addAdminDto.name,
      email: addAdminDto.email,
      passwordHash,
      roleId: role.id,
      isActive: true,
    });

    const savedAdmin = await this.adminRepository.save(newAdmin);

    return {
      id: savedAdmin.id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      role: role.name,
      password: randomPassword,
    };
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

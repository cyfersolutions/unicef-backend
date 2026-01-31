import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalInfo } from './entities/personal-info.entity';
import { Vaccinator } from './entities/vaccinator.entity';
import { Supervisor } from './entities/supervisor.entity';
import { CreateVaccinatorDto } from './dto/create-vaccinator.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateVaccinatorDto } from './dto/update-vaccinator.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Admin } from '../admins/entities/admin.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(PersonalInfo)
    private personalInfoRepository: Repository<PersonalInfo>,
    @InjectRepository(Vaccinator)
    private vaccinatorRepository: Repository<Vaccinator>,
    @InjectRepository(Supervisor)
    private supervisorRepository: Repository<Supervisor>,
  ) {}

  // ========== Vaccinator Operations ==========

  async createVaccinator(createVaccinatorDto: CreateVaccinatorDto): Promise<Vaccinator> {
    // Check if email or cnic already exists
    const existingPersonalInfo = await this.personalInfoRepository.findOne({
      where: [
        { email: createVaccinatorDto.email },
        { cnic: createVaccinatorDto.cnic },
      ],
    });

    if (existingPersonalInfo) {
      throw new BadRequestException('Email or CNIC already exists');
    }

    // Validate supervisor if provided
    if (createVaccinatorDto.supervisorId) {
      const supervisor = await this.supervisorRepository.findOne({
        where: { id: createVaccinatorDto.supervisorId },
      });

      if (!supervisor) {
        throw new NotFoundException(`Supervisor with ID ${createVaccinatorDto.supervisorId} not found`);
      }
    }

    // Create personal info
    const personalInfo = this.personalInfoRepository.create({
      name: createVaccinatorDto.name,
      email: createVaccinatorDto.email,
      cnic: createVaccinatorDto.cnic,
      phone: createVaccinatorDto.phone,
      address: createVaccinatorDto.address,
    });

    const savedPersonalInfo = await this.personalInfoRepository.save(personalInfo);

    // Create vaccinator
    const vaccinator = this.vaccinatorRepository.create({
      supervisorId: createVaccinatorDto.supervisorId || null,
      detailId: savedPersonalInfo.id,
      isActive: createVaccinatorDto.isActive !== undefined ? createVaccinatorDto.isActive : true,
    });

    return this.vaccinatorRepository.save(vaccinator);
  }

  async findAllVaccinators(currentAdmin: Admin): Promise<Vaccinator[]> {
    const adminRole = currentAdmin.role?.name;

    // Superadmin and admin can see all vaccinators
    if (adminRole === 'superadmin' || adminRole === 'admin') {
      return this.vaccinatorRepository.find({
        relations: ['personalInfo', 'supervisor', 'supervisor.personalInfo'],
        order: { createdAt: 'DESC' },
      });
    }

    // Supervisor can only see their assigned vaccinators
    // Note: This assumes supervisors will authenticate differently in the future
    // For now, we'll return empty array or handle this case
    return [];
  }

  async findVaccinatorById(id: string, currentAdmin: Admin): Promise<Vaccinator> {
    const vaccinator = await this.vaccinatorRepository.findOne({
      where: { id },
      relations: ['personalInfo', 'supervisor', 'supervisor.personalInfo'],
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${id} not found`);
    }

    const adminRole = currentAdmin.role?.name;

    // Superadmin and admin can access any vaccinator
    if (adminRole === 'superadmin' || adminRole === 'admin') {
      return vaccinator;
    }

    // Supervisor can only access their assigned vaccinators
    // Note: This will need to be implemented when supervisor authentication is added
    throw new NotFoundException(`Vaccinator with ID ${id} not found`);
  }

  async updateVaccinator(id: string, updateVaccinatorDto: UpdateVaccinatorDto, currentAdmin: Admin): Promise<Vaccinator> {
    const vaccinator = await this.vaccinatorRepository.findOne({
      where: { id },
      relations: ['personalInfo'],
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${id} not found`);
    }

    // Update supervisor if provided
    if (updateVaccinatorDto.supervisorId !== undefined) {
      if (updateVaccinatorDto.supervisorId) {
        const supervisor = await this.supervisorRepository.findOne({
          where: { id: updateVaccinatorDto.supervisorId },
        });

        if (!supervisor) {
          throw new NotFoundException(`Supervisor with ID ${updateVaccinatorDto.supervisorId} not found`);
        }
      }
      vaccinator.supervisorId = updateVaccinatorDto.supervisorId || null;
    }

    // Update isActive if provided
    if (updateVaccinatorDto.isActive !== undefined) {
      vaccinator.isActive = updateVaccinatorDto.isActive;
    }

    // Update personal info if provided
    if (vaccinator.personalInfo) {
      const personalInfoUpdates: Partial<PersonalInfo> = {};

      if (updateVaccinatorDto.name !== undefined) {
        personalInfoUpdates.name = updateVaccinatorDto.name;
      }
      if (updateVaccinatorDto.email !== undefined) {
        // Check if email already exists for another personal info
        const existingPersonalInfo = await this.personalInfoRepository.findOne({
          where: { email: updateVaccinatorDto.email },
        });

        if (existingPersonalInfo && existingPersonalInfo.id !== vaccinator.detailId) {
          throw new BadRequestException('Email already exists');
        }
        personalInfoUpdates.email = updateVaccinatorDto.email;
      }
      if (updateVaccinatorDto.cnic !== undefined) {
        // Check if cnic already exists for another personal info
        const existingPersonalInfo = await this.personalInfoRepository.findOne({
          where: { cnic: updateVaccinatorDto.cnic },
        });

        if (existingPersonalInfo && existingPersonalInfo.id !== vaccinator.detailId) {
          throw new BadRequestException('CNIC already exists');
        }
        personalInfoUpdates.cnic = updateVaccinatorDto.cnic;
      }
      if (updateVaccinatorDto.phone !== undefined) {
        personalInfoUpdates.phone = updateVaccinatorDto.phone;
      }
      if (updateVaccinatorDto.address !== undefined) {
        personalInfoUpdates.address = updateVaccinatorDto.address;
      }

      if (Object.keys(personalInfoUpdates).length > 0) {
        await this.personalInfoRepository.update(vaccinator.detailId, personalInfoUpdates);
      }
    }

    await this.vaccinatorRepository.save(vaccinator);

    return this.findVaccinatorById(id, currentAdmin);
  }

  async removeVaccinator(id: string): Promise<void> {
    const vaccinator = await this.vaccinatorRepository.findOne({
      where: { id },
      relations: ['personalInfo'],
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${id} not found`);
    }

    // Delete vaccinator (cascade will delete personal info)
    await this.vaccinatorRepository.remove(vaccinator);
  }

  // ========== Supervisor Operations ==========

  async createSupervisor(createSupervisorDto: CreateSupervisorDto): Promise<Supervisor> {
    // Check if email or cnic already exists
    const existingPersonalInfo = await this.personalInfoRepository.findOne({
      where: [
        { email: createSupervisorDto.email },
        { cnic: createSupervisorDto.cnic },
      ],
    });

    if (existingPersonalInfo) {
      throw new BadRequestException('Email or CNIC already exists');
    }

    // Create personal info
    const personalInfo = this.personalInfoRepository.create({
      name: createSupervisorDto.name,
      email: createSupervisorDto.email,
      cnic: createSupervisorDto.cnic,
      phone: createSupervisorDto.phone,
      address: createSupervisorDto.address,
    });

    const savedPersonalInfo = await this.personalInfoRepository.save(personalInfo);

    // Create supervisor
    const supervisor = this.supervisorRepository.create({
      detailId: savedPersonalInfo.id,
      isActive: createSupervisorDto.isActive !== undefined ? createSupervisorDto.isActive : true,
    });

    return this.supervisorRepository.save(supervisor);
  }

  async findAllSupervisors(): Promise<Supervisor[]> {
    return this.supervisorRepository.find({
      relations: ['personalInfo', 'vaccinators', 'vaccinators.personalInfo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSupervisorById(id: string): Promise<Supervisor> {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id },
      relations: ['personalInfo', 'vaccinators', 'vaccinators.personalInfo'],
    });

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }

    return supervisor;
  }

  async findSupervisorVaccinators(supervisorId: string): Promise<Vaccinator[]> {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${supervisorId} not found`);
    }

    return this.vaccinatorRepository.find({
      where: { supervisorId },
      relations: ['personalInfo'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateSupervisor(id: string, updateSupervisorDto: UpdateSupervisorDto): Promise<Supervisor> {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id },
      relations: ['personalInfo'],
    });

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }

    // Update isActive if provided
    if (updateSupervisorDto.isActive !== undefined) {
      supervisor.isActive = updateSupervisorDto.isActive;
    }

    // Update personal info if provided
    if (supervisor.personalInfo) {
      const personalInfoUpdates: Partial<PersonalInfo> = {};

      if (updateSupervisorDto.name !== undefined) {
        personalInfoUpdates.name = updateSupervisorDto.name;
      }
      if (updateSupervisorDto.email !== undefined) {
        // Check if email already exists for another personal info
        const existingPersonalInfo = await this.personalInfoRepository.findOne({
          where: { email: updateSupervisorDto.email },
        });

        if (existingPersonalInfo && existingPersonalInfo.id !== supervisor.detailId) {
          throw new BadRequestException('Email already exists');
        }
        personalInfoUpdates.email = updateSupervisorDto.email;
      }
      if (updateSupervisorDto.cnic !== undefined) {
        // Check if cnic already exists for another personal info
        const existingPersonalInfo = await this.personalInfoRepository.findOne({
          where: { cnic: updateSupervisorDto.cnic },
        });

        if (existingPersonalInfo && existingPersonalInfo.id !== supervisor.detailId) {
          throw new BadRequestException('CNIC already exists');
        }
        personalInfoUpdates.cnic = updateSupervisorDto.cnic;
      }
      if (updateSupervisorDto.phone !== undefined) {
        personalInfoUpdates.phone = updateSupervisorDto.phone;
      }
      if (updateSupervisorDto.address !== undefined) {
        personalInfoUpdates.address = updateSupervisorDto.address;
      }

      if (Object.keys(personalInfoUpdates).length > 0) {
        await this.personalInfoRepository.update(supervisor.detailId, personalInfoUpdates);
      }
    }

    await this.supervisorRepository.save(supervisor);

    return this.findSupervisorById(id);
  }

  async removeSupervisor(id: string): Promise<void> {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id },
      relations: ['personalInfo'],
    });

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }

    // Delete supervisor (cascade will delete personal info)
    await this.supervisorRepository.remove(supervisor);
  }
}


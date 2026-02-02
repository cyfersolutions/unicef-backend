import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { NeirCallbackDto } from './dto/neir-callback.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NeirService } from './services/neir.service';
import { RedisService } from './services/redis.service';
import { UsersService } from '../users/users.service';
import { PersonalInfo } from '../users/entities/personal-info.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { Supervisor } from '../users/entities/supervisor.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(PersonalInfo)
    private personalInfoRepository: Repository<PersonalInfo>,
    @InjectRepository(Vaccinator)
    private vaccinatorRepository: Repository<Vaccinator>,
    @InjectRepository(Supervisor)
    private supervisorRepository: Repository<Supervisor>,
    private jwtService: JwtService,
    private neirService: NeirService,
    private redisService: RedisService,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.adminRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role', 'adminPermissions', 'adminPermissions.permission'],
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: admin.email, sub: admin.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role?.name,
      },
    };
  }

  async checkAuth(admin: Admin) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role?.name,
    };
  }

  async logout(token?: string) {
    // Blacklist JWT token if provided
    if (token) {
      try {
        // Decode token to get expiration time
        const decoded = this.jwtService.decode(token) as any;
        if (decoded && decoded.exp) {
          await this.redisService.addTokenToBlacklist(token, decoded.exp);
        }
      } catch (error) {
        // If token decode fails, still proceed with logout
        console.error('Error blacklisting token:', error);
      }
    }
    
    return { message: 'Logged out successfully' };
  }

  async neirCallback(neirCallbackDto: NeirCallbackDto) {
    // Verify session and token with NEIR SSO
    const neirResponse = await this.neirService.verifyCallback(
      neirCallbackDto.session_id,
      neirCallbackDto.neir_token,
    );

    // Fetch user profile from NEIR
    const neirUser = await this.neirService.getUserProfile(neirResponse.user_id);

    // Determine role - prioritize from callback DTO, then from NEIR user, default to vaccinator
    const userRole = neirCallbackDto.role || neirUser.role || 'vaccinator';

    // Upsert user in Postgres based on role
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user: Vaccinator | Supervisor;
      let personalInfo: PersonalInfo | null;

      // Check if personal info exists by email
      personalInfo = await queryRunner.manager.findOne(PersonalInfo, {
        where: { email: neirUser.email },
      }) ;

      const personalInfoData = {
        name: `${neirUser.firstName} ${neirUser.lastName}`,
        email: neirUser.email,
        cnic: neirUser.cnic, // Set to empty string if not provided
        phone: '', // Set to empty string if not provided
        address: '', // Set to empty string if not provided
      };

      if (personalInfo) {
        // Update existing personal info
        await queryRunner.manager.update(PersonalInfo, personalInfo.id, personalInfoData);
        personalInfo = await queryRunner.manager.findOne(PersonalInfo, {
          where: { id: personalInfo.id },
        });
      } else {
        // Create new personal info
        personalInfo = queryRunner.manager.create(PersonalInfo, personalInfoData);
        personalInfo = await queryRunner.manager.save(PersonalInfo, personalInfo);
      }

      if (userRole === 'vaccinator') {
        // Upsert vaccinator
        let vaccinator = await queryRunner.manager.findOne(Vaccinator, {
          where: { detailId: personalInfo?.id },
        });

        if (vaccinator) {
          vaccinator.isActive = true;
          vaccinator = await queryRunner.manager.save(Vaccinator, vaccinator);
        } else {
          vaccinator = queryRunner.manager.create(Vaccinator, {
            detailId: personalInfo?.id,
            isActive: true
          });
          vaccinator = await queryRunner.manager.save(Vaccinator, vaccinator);
        }
        user = vaccinator;
      } else {
        // Upsert supervisor
        let supervisor = await queryRunner.manager.findOne(Supervisor, {
          where: { detailId: personalInfo?.id },
        });

        if (supervisor) {
          supervisor.isActive = true;
          supervisor = await queryRunner.manager.save(Supervisor, supervisor);
        } else {
          supervisor = queryRunner.manager.create(Supervisor, {
            detailId: personalInfo?.id,
            isActive: true,
          });
          supervisor = await queryRunner.manager.save(Supervisor, supervisor);
        }
        user = supervisor;
      }

      await queryRunner.commitTransaction();

      // Store NEIR token in Redis
      await this.redisService.setNeirToken(user.id, neirCallbackDto.neir_token);

      // Generate Gamification JWT
      const payload = {
        sub: user.id,
        email: neirUser.email,
        role: userRole,
        type: userRole === 'vaccinator' ? 'vaccinator' : 'supervisor',
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: neirUser.email,
          name: personalInfo?.name,
          role: userRole,
          completed: personalInfo?.completed || false,
          province: personalInfo?.province || '',
          designation: personalInfo?.designation || '',
           
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error)
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProfile(userId: string, role: 'vaccinator' | 'supervisor') {
    if (role === 'vaccinator') {
      const vaccinator = await this.vaccinatorRepository.findOne({
        where: { id: userId },
        relations: ['personalInfo'],
      });

      if (!vaccinator) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: vaccinator.id,
        email: vaccinator.personalInfo.email,
        name: vaccinator.personalInfo.name,
        role: 'vaccinator',
        cnic: vaccinator.personalInfo.cnic || '',
        phone: vaccinator.personalInfo.phone || '',
        address: vaccinator.personalInfo.address || '',
        province: vaccinator.personalInfo.province || '',
        designation: vaccinator.personalInfo.designation || '',
        completed: vaccinator.personalInfo.completed || false,
      };
    } else {
      const supervisor = await this.supervisorRepository.findOne({
        where: { id: userId },
        relations: ['personalInfo'],
      });

      if (!supervisor) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: supervisor.id,
        email: supervisor.personalInfo.email,
        name: supervisor.personalInfo.name,
        role: 'supervisor',
        cnic: supervisor.personalInfo.cnic || '',
        phone: supervisor.personalInfo.phone || '',
        address: supervisor.personalInfo.address || '',
        province: supervisor.personalInfo.province || '',
        designation: supervisor.personalInfo.designation || '',
        completed: supervisor.personalInfo.completed || false,
      };
    }
  }

  async logoutUser(userId: string, token?: string) {
    // Delete NEIR token from Redis
    await this.redisService.deleteNeirToken(userId);
    
    // Blacklist JWT token if provided
    if (token) {
      try {
        // Decode token to get expiration time
        const decoded = this.jwtService.decode(token) as any;
        if (decoded && decoded.exp) {
          await this.redisService.addTokenToBlacklist(token, decoded.exp);
        }
      } catch (error) {
        // If token decode fails, still proceed with logout
        console.error('Error blacklisting token:', error);
      }
    }
    
    return { message: 'Logged out successfully' };
  }

  async updateProfile(
    userId: string,
    role: 'vaccinator' | 'supervisor',
    updateProfileDto: UpdateProfileDto,
  ) {
    let user: Vaccinator | Supervisor | null;

    if (role === 'vaccinator') {
      user = await this.vaccinatorRepository.findOne({
        where: { id: userId },
        relations: ['personalInfo'],
      });
    } else {
      user = await this.supervisorRepository.findOne({
        where: { id: userId },
        relations: ['personalInfo'],
      });
    }

    if (!user || !user.personalInfo) {
      throw new UnauthorizedException('User not found');
    }

    // Update personal info fields
    const updateData: Partial<PersonalInfo> = {
      ...updateProfileDto,
      completed: true, // Set completed to true when profile is updated
    };

    await this.personalInfoRepository.update(user.personalInfo.id, updateData);

    // Fetch updated personal info
    const updatedPersonalInfo = await this.personalInfoRepository.findOne({
      where: { id: user.personalInfo.id },
    });

    return {
      id: user.id,
      email: updatedPersonalInfo?.email || '',
      name: updatedPersonalInfo?.name || '',
      role: role,
      cnic: updatedPersonalInfo?.cnic || '',
      phone: updatedPersonalInfo?.phone || '',
      address: updatedPersonalInfo?.address || '',
      province: updatedPersonalInfo?.province || '',
      designation: updatedPersonalInfo?.designation || '',
      completed: updatedPersonalInfo?.completed || false,
    };
  }
}

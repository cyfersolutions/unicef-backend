import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateVaccinatorDto } from './dto/create-vaccinator.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateVaccinatorDto } from './dto/update-vaccinator.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserManagementGuard } from '../auth/guards/user-management.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Admin } from '../admins/entities/admin.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========== Vaccinator Endpoints ==========

  @Post('vaccinators')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vaccinator (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Vaccinator created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or email/CNIC already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supervisor not found (if supervisorId provided)' })
  async createVaccinator(@Body() createVaccinatorDto: CreateVaccinatorDto) {
    return this.usersService.createVaccinator(createVaccinatorDto);
  }

  @Get('vaccinators')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all vaccinators (superadmin/admin can see all, supervisor sees assigned only)' })
  @ApiResponse({ status: 200, description: 'List of vaccinators' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAllVaccinators(@CurrentUser() admin: Admin) {
    return this.usersService.findAllVaccinators(admin);
  }

  @Get('vaccinators/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get vaccinator by ID (superadmin/admin can access any, supervisor only assigned)' })
  @ApiParam({ name: 'id', description: 'Vaccinator UUID' })
  @ApiResponse({ status: 200, description: 'Vaccinator found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Vaccinator not found' })
  async findVaccinatorById(@Param('id') id: string, @CurrentUser() admin: Admin) {
    return this.usersService.findVaccinatorById(id, admin);
  }

  @Patch('vaccinators/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vaccinator (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Vaccinator UUID' })
  @ApiResponse({ status: 200, description: 'Vaccinator updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or email/CNIC already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Vaccinator or supervisor not found' })
  async updateVaccinator(
    @Param('id') id: string,
    @Body() updateVaccinatorDto: UpdateVaccinatorDto,
    @CurrentUser() admin: Admin,
  ) {
    return this.usersService.updateVaccinator(id, updateVaccinatorDto, admin);
  }

  @Delete('vaccinators/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete vaccinator (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Vaccinator UUID' })
  @ApiResponse({ status: 200, description: 'Vaccinator deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Vaccinator not found' })
  async removeVaccinator(@Param('id') id: string) {
    await this.usersService.removeVaccinator(id);
    return { message: 'Vaccinator deleted successfully' };
  }

  // ========== Supervisor Endpoints ==========

  @Post('supervisors')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new supervisor (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Supervisor created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or email/CNIC already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async createSupervisor(@Body() createSupervisorDto: CreateSupervisorDto) {
    return this.usersService.createSupervisor(createSupervisorDto);
  }

  @Get('supervisors')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all supervisors (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiResponse({ status: 200, description: 'List of supervisors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAllSupervisors() {
    return this.usersService.findAllSupervisors();
  }

  @Get('supervisors/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get supervisor by ID (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Supervisor UUID' })
  @ApiResponse({ status: 200, description: 'Supervisor found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorById(@Param('id') id: string) {
    return this.usersService.findSupervisorById(id);
  }

  @Get('supervisors/:id/vaccinators')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get vaccinators assigned to a supervisor (superadmin/admin can access any, supervisor only their own)' })
  @ApiParam({ name: 'id', description: 'Supervisor UUID' })
  @ApiResponse({ status: 200, description: 'List of vaccinators assigned to supervisor' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorVaccinators(@Param('id') id: string) {
    return this.usersService.findSupervisorVaccinators(id);
  }

  @Patch('supervisors/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update supervisor (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Supervisor UUID' })
  @ApiResponse({ status: 200, description: 'Supervisor updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or email/CNIC already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async updateSupervisor(
    @Param('id') id: string,
    @Body() updateSupervisorDto: UpdateSupervisorDto,
  ) {
    return this.usersService.updateSupervisor(id, updateSupervisorDto);
  }

  @Delete('supervisors/:id')
  @UseGuards(JwtAuthGuard, UserManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete supervisor (superadmin/admin with USER_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Supervisor UUID' })
  @ApiResponse({ status: 200, description: 'Supervisor deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async removeSupervisor(@Param('id') id: string) {
    await this.usersService.removeSupervisor(id);
    return { message: 'Supervisor deleted successfully' };
  }
}


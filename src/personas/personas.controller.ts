import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new persona (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Persona created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can create personas' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all personas (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of personas' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get persona by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Persona UUID' })
  @ApiResponse({ status: 200, description: 'Persona found' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update persona (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Persona UUID' })
  @ApiResponse({ status: 200, description: 'Persona updated successfully' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can update personas' })
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete persona (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Persona UUID' })
  @ApiResponse({ status: 200, description: 'Persona deleted successfully' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can delete personas' })
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}


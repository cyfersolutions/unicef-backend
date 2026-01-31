import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { StreaksService } from './streaks.service';
import { CreateStreakDto } from './dto/create-streak.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';
import { SubmitStreakProgressDto } from './dto/submit-streak-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('streaks')
@Controller('streaks')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new streak (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Streak created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can create streaks' })
  create(@Body() createStreakDto: CreateStreakDto) {
    return this.streaksService.create(createStreakDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all streaks (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of streaks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.streaksService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get streak by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Streak UUID' })
  @ApiResponse({ status: 200, description: 'Streak found' })
  @ApiResponse({ status: 404, description: 'Streak not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.streaksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update streak (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Streak UUID' })
  @ApiResponse({ status: 200, description: 'Streak updated successfully' })
  @ApiResponse({ status: 404, description: 'Streak not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can update streaks' })
  update(@Param('id') id: string, @Body() updateStreakDto: UpdateStreakDto) {
    return this.streaksService.update(id, updateStreakDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete streak (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Streak UUID' })
  @ApiResponse({ status: 200, description: 'Streak deleted successfully' })
  @ApiResponse({ status: 404, description: 'Streak not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can delete streaks' })
  remove(@Param('id') id: string) {
    return this.streaksService.remove(id);
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit streak progress' })
  @ApiResponse({
    status: 202,
    description: 'Streak progress submitted successfully, processing in background',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Streak progress not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitStreakProgress(@Body() dto: SubmitStreakProgressDto) {
    return this.streaksService.submitStreakProgress(dto);
  }
}

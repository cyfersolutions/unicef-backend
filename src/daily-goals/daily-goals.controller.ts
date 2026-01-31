import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DailyGoalsService } from './daily-goals.service';
import { CreateDailyGoalDto } from './dto/create-daily-goal.dto';
import { UpdateDailyGoalDto } from './dto/update-daily-goal.dto';
import { SubmitDailyGoalProgressDto } from './dto/submit-daily-goal-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('daily-goals')
@Controller('daily-goals')
export class DailyGoalsController {
  constructor(private readonly dailyGoalsService: DailyGoalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new daily goal (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Daily goal created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can create daily goals' })
  create(@Body() createDailyGoalDto: CreateDailyGoalDto) {
    return this.dailyGoalsService.create(createDailyGoalDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all daily goals (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of daily goals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.dailyGoalsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get daily goal by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Daily goal UUID' })
  @ApiResponse({ status: 200, description: 'Daily goal found' })
  @ApiResponse({ status: 404, description: 'Daily goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.dailyGoalsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update daily goal (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Daily goal UUID' })
  @ApiResponse({ status: 200, description: 'Daily goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Daily goal not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can update daily goals' })
  update(@Param('id') id: string, @Body() updateDailyGoalDto: UpdateDailyGoalDto) {
    return this.dailyGoalsService.update(id, updateDailyGoalDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete daily goal (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Daily goal UUID' })
  @ApiResponse({ status: 200, description: 'Daily goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Daily goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can delete daily goals' })
  remove(@Param('id') id: string) {
    return this.dailyGoalsService.remove(id);
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit daily goal progress ' })
  @ApiResponse({
    status: 202,
    description: 'Daily goal progress submitted successfully, processing in background',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Daily goal progress not found' })
  async submitDailyGoalProgress(@Body() dto: SubmitDailyGoalProgressDto) {
    return this.dailyGoalsService.submitDailyGoalProgress(dto);
  }
}

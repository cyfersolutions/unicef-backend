import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddQuestionToLessonDto } from './dto/add-question-to-lesson.dto';
import { UpdateQuestionOrderDto } from './dto/update-question-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lesson (superadmin/admin only)' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can create lessons' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all lessons (authenticated users)' })
  @ApiQuery({ name: 'unitId', required: false, description: 'Filter lessons by unit ID' })
  @ApiResponse({ status: 200, description: 'List of lessons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('unitId') unitId?: string) {
    return this.lessonsService.findAll(unitId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get lesson by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson found' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lesson (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update lessons' })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lesson order number (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson order updated successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update lesson order' })
  updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.lessonsService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete lesson (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can delete lessons' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  // Lesson Questions Management Endpoints

  @Get(':id/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all questions for a lesson (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'List of questions for the lesson' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLessonQuestions(@Param('id') id: string) {
    return this.lessonsService.getLessonQuestions(id);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a question to a lesson (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 201, description: 'Question added to lesson successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - question already in lesson or order number conflict' })
  @ApiResponse({ status: 404, description: 'Lesson or question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  addQuestionToLesson(@Param('id') lessonId: string, @Body() addQuestionDto: AddQuestionToLessonDto) {
    return this.lessonsService.addQuestionToLesson(lessonId, addQuestionDto.questionId, addQuestionDto.orderNo);
  }

  @Delete(':lessonId/questions/:questionId')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a question from a lesson (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question removed from lesson successfully' })
  @ApiResponse({ status: 404, description: 'Question not found in lesson' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  removeQuestionFromLesson(@Param('lessonId') lessonId: string, @Param('questionId') questionId: string) {
    return this.lessonsService.removeQuestionFromLesson(lessonId, questionId);
  }

  @Patch(':lessonId/questions/:questionId/order')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update question order in a lesson (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question order updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - order number conflict' })
  @ApiResponse({ status: 404, description: 'Question not found in lesson' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  updateQuestionOrder(
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
    @Body() updateOrderDto: UpdateQuestionOrderDto,
  ) {
    return this.lessonsService.updateQuestionOrder(lessonId, questionId, updateOrderDto.orderNo);
  }
}


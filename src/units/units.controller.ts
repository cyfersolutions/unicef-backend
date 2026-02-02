import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { LessonsService } from '../lessons/lessons.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(
    private readonly unitsService: UnitsService,
    private readonly lessonsService: LessonsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new unit (superadmin/admin only)' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can create units' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all units (authenticated users)' })
  @ApiQuery({ name: 'moduleId', required: false, description: 'Filter units by module ID' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter by unit ID' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title (partial match)' })
  @ApiQuery({ name: 'description', required: false, description: 'Filter by description (partial match)' })
  @ApiQuery({ name: 'orderNo', required: false, description: 'Filter by order number' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status (true/false)' })
  @ApiQuery({ name: 'createdAtFrom', required: false, description: 'Filter by creation date from (ISO date)' })
  @ApiQuery({ name: 'createdAtTo', required: false, description: 'Filter by creation date to (ISO date)' })
  @ApiResponse({ status: 200, description: 'List of units with totalLessons count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: Record<string, any>) {
    const { moduleId, ...filters } = query;
    return this.unitsService.findAll(moduleId, filters);
  }

  @Get(':unitId/lessons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get lessons by unit ID (authenticated users)' })
  @ApiParam({ name: 'unitId', description: 'Unit UUID' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter by lesson ID' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title (partial match)' })
  @ApiQuery({ name: 'description', required: false, description: 'Filter by description (partial match)' })
  @ApiQuery({ name: 'iconUrl', required: false, description: 'Filter by icon URL' })
  @ApiQuery({ name: 'orderNo', required: false, description: 'Filter by order number' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status (true/false)' })
  @ApiQuery({ name: 'passThreshold', required: false, description: 'Filter by pass threshold' })
  @ApiQuery({ name: 'failedThreshold', required: false, description: 'Filter by failed threshold' })
  @ApiQuery({ name: 'createdAtFrom', required: false, description: 'Filter by creation date from (ISO date)' })
  @ApiQuery({ name: 'createdAtTo', required: false, description: 'Filter by creation date to (ISO date)' })
  @ApiResponse({ status: 200, description: 'List of lessons for the unit with totalQuestions count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLessonsByUnitId(@Param('unitId') unitId: string, @Query() filters: Record<string, any>) {
    return this.lessonsService.findAll(unitId, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get unit by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit found' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Get(':id/with-progress')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get unit by ID with progress and lessons with progress for current vaccinator' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit found with progress and lessons' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOneWithProgress(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' },
  ) {
    return this.unitsService.findOneWithProgress(id, user.userId);
  }

  @Get('module/:moduleId/with-progress')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all units by module ID with progress and lessons with progress for current vaccinator' })
  @ApiParam({ name: 'moduleId', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'List of units with progress and lessons' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllByModuleWithProgress(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' },
  ) {
    return this.unitsService.findAllByModuleWithProgress(moduleId, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update unit (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update units' })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update unit order number (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit order updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update unit order' })
  updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.unitsService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete unit (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can delete units' })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}

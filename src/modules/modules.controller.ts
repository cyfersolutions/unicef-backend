import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { UnitsService } from '../units/units.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly unitsService: UnitsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new module (superadmin/admin only)' })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can create modules' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all modules (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of modules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.modulesService.findAll();
  }

  @Get('with-progress')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all modules with progress for current vaccinator' })
  @ApiResponse({ status: 200, description: 'List of modules with progress and isLocked status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllWithProgress(@CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' }) {
    return this.modulesService.findAllWithProgress(user.userId);
  }

  @Get('dashboard')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get dashboard data for current vaccinator (totalXp and current unit progress)' })
  @ApiResponse({ status: 200, description: 'Dashboard data with totalXp and current unit information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDashboard(@CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' }) {
    return this.modulesService.getDashboard(user.userId);
  }

  @Get(':moduleId/units')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get units by module ID (authenticated users)' })
  @ApiParam({ name: 'moduleId', description: 'Module UUID' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter by unit ID' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title (partial match)' })
  @ApiQuery({ name: 'description', required: false, description: 'Filter by description (partial match)' })
  @ApiQuery({ name: 'orderNo', required: false, description: 'Filter by order number' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status (true/false)' })
  @ApiQuery({ name: 'createdAtFrom', required: false, description: 'Filter by creation date from (ISO date)' })
  @ApiQuery({ name: 'createdAtTo', required: false, description: 'Filter by creation date to (ISO date)' })
  @ApiResponse({ status: 200, description: 'List of units for the module with totalLessons count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnitsByModuleId(@Param('moduleId') moduleId: string, @Query() filters: Record<string, any>) {
    return this.unitsService.findAll(moduleId, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get module by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module found' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update module (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update modules' })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update module order number (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module order updated successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can update module order' })
  updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.modulesService.updateOrder(id, updateOrderDto.orderNo);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete module (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin/admin can delete modules' })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}

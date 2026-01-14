import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new badge (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Badge created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can create badges' })
  create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgesService.create(createBadgeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all badges (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of badges' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.badgesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get badge by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Badge UUID' })
  @ApiResponse({ status: 200, description: 'Badge found' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.badgesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update badge (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Badge UUID' })
  @ApiResponse({ status: 200, description: 'Badge updated successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can update badges' })
  update(@Param('id') id: string, @Body() updateBadgeDto: UpdateBadgeDto) {
    return this.badgesService.update(id, updateBadgeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete badge (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Badge UUID' })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can delete badges' })
  remove(@Param('id') id: string) {
    return this.badgesService.remove(id);
  }
}

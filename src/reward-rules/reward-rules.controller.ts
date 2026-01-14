import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RewardRulesService } from './reward-rules.service';
import { CreateRewardRuleDto } from './dto/create-reward-rule.dto';
import { UpdateRewardRuleDto } from './dto/update-reward-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPManagementGuard } from '../auth/guards/xp-management.guard';

@ApiTags('reward-rules')
@Controller('reward-rules')
export class RewardRulesController {
  constructor(private readonly rewardRulesService: RewardRulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reward rule (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiResponse({ status: 201, description: 'Reward rule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can create reward rules' })
  create(@Body() createRewardRuleDto: CreateRewardRuleDto) {
    return this.rewardRulesService.create(createRewardRuleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all reward rules (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of reward rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.rewardRulesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get reward rule by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Reward rule UUID' })
  @ApiResponse({ status: 200, description: 'Reward rule found' })
  @ApiResponse({ status: 404, description: 'Reward rule not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.rewardRulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update reward rule (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Reward rule UUID' })
  @ApiResponse({ status: 200, description: 'Reward rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Reward rule not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can update reward rules' })
  update(@Param('id') id: string, @Body() updateRewardRuleDto: UpdateRewardRuleDto) {
    return this.rewardRulesService.update(id, updateRewardRuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, XPManagementGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete reward rule (superadmin or admin with XP_MANAGEMENT permission)' })
  @ApiParam({ name: 'id', description: 'Reward rule UUID' })
  @ApiResponse({ status: 200, description: 'Reward rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reward rule not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin or admin with XP_MANAGEMENT permission can delete reward rules' })
  remove(@Param('id') id: string) {
    return this.rewardRulesService.remove(id);
  }
}

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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingQuestionDto } from './dto/create-onboarding-question.dto';
import { UpdateOnboardingQuestionDto } from './dto/update-onboarding-question.dto';
import { SubmitOnboardingResponseDto } from './dto/submit-onboarding-response.dto';
import { SubmitOnboardingResponsesDto } from './dto/submit-onboarding-responses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create onboarding question (superadmin/admin only)' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createOnboardingQuestionDto: CreateOnboardingQuestionDto) {
    return this.onboardingService.create(createOnboardingQuestionDto);
  }

  @Get('questions')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all active onboarding questions (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of onboarding questions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.onboardingService.findAll();
  }

  @Get('questions/:id')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get onboarding question by ID (authenticated users)' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question found' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.onboardingService.findOne(id);
  }

  @Patch('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update onboarding question (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateOnboardingQuestionDto: UpdateOnboardingQuestionDto) {
    return this.onboardingService.update(id, updateOnboardingQuestionDto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles('superadmin', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete onboarding question (superadmin/admin only)' })
  @ApiParam({ name: 'id', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.onboardingService.remove(id);
  }

  @Post('responses')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit onboarding question response (authenticated users)' })
  @ApiResponse({ status: 201, description: 'Response submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid answer' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  submitResponse(
    @Body() submitResponseDto: SubmitOnboardingResponseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.onboardingService.submitResponse(submitResponseDto, user.userId);
  }

  @Get('responses')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user onboarding responses (authenticated users)' })
  @ApiResponse({ status: 200, description: 'List of user responses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyResponses(@CurrentUser() user: { userId: string }) {
    return this.onboardingService.getVaccinatorResponses(user.userId);
  }

  @Post('responses/bulk')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit multiple onboarding question responses at once (authenticated users)' })
  @ApiResponse({ status: 201, description: 'Responses submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid answer(s)' })
  @ApiResponse({ status: 404, description: 'Question(s) not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  submitResponses(
    @Body() submitResponsesDto: SubmitOnboardingResponsesDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.onboardingService.submitResponses(submitResponsesDto, user.userId);
  }
}


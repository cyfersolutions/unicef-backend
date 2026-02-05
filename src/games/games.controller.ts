import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SubmitGameProgressDto } from './dto/submit-game-progress.dto';
import { SubmitGameCompletionDto } from './dto/submit-game-completion.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { AssignGameToUnitLessonDto } from './dto/assign-game.dto';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit game progress (Open endpoint - no authentication required)' })
  @ApiBody({ type: SubmitGameProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Game progress saved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Game progress saved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            unitGameId: { type: 'string', format: 'uuid' },
            vaccinatorId: { type: 'string', format: 'uuid' },
            score: { type: 'number' },
            attempt: { type: 'number' },
            ratings: { type: 'number', nullable: true },
            otherFields: { type: 'object', nullable: true },
            isCompleted: { type: 'boolean' },
            isPassed: { type: 'boolean' },
            xpEarned: { type: 'number' },
            game: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
              },
            },
            unit: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit game or vaccinator not found',
  })
  async submitGameProgress(@Body() dto: SubmitGameProgressDto) {
    return this.gamesService.submitGameProgress(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new game' })
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Game created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            url: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async createGame(@Body() dto: CreateGameDto) {
    return this.gamesService.createGame(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a game' })
  @ApiParam({ name: 'id', description: 'Game UUID', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateGameDto })
  @ApiResponse({
    status: 200,
    description: 'Game updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Game updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            url: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async updateGame(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.gamesService.updateGame(id, dto);
  }

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a game to a unit and lesson' })
  @ApiBody({ type: AssignGameToUnitLessonDto })
  @ApiResponse({
    status: 201,
    description: 'Game assigned to unit and lesson successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Game assigned to unit and lesson successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            game: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                url: { type: 'string', nullable: true },
              },
            },
            unit: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
              },
            },
            lesson: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
              },
            },
            passingScore: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or game already assigned',
  })
  @ApiResponse({
    status: 404,
    description: 'Game, unit, or lesson not found',
  })
  async assignGameToUnitLesson(@Body() dto: AssignGameToUnitLessonDto) {
    return this.gamesService.assignGameToUnitLesson(dto);
  }

  @Post('complete')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit game completion (authenticated vaccinators)' })
  @ApiBody({ type: SubmitGameCompletionDto })
  @ApiResponse({
    status: 200,
    description: 'Game completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Game completed successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            unitGameId: { type: 'string', format: 'uuid' },
            vaccinatorId: { type: 'string', format: 'uuid' },
            score: { type: 'number' },
            attempt: { type: 'number' },
            ratings: { type: 'number', nullable: true },
            otherFields: { type: 'object', nullable: true },
            isCompleted: { type: 'boolean', example: true },
            isPassed: { type: 'boolean' },
            xpEarned: { type: 'number' },
            game: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                url: { type: 'string', nullable: true },
              },
            },
            unit: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
              },
            },
            lesson: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit game or vaccinator not found',
  })
  async submitGameCompletion(
    @Body() dto: SubmitGameCompletionDto,
    @CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' },
  ) {
    const vaccinatorId = user?.userId;
    if (!vaccinatorId) {
      throw new Error('Vaccinator ID not found in token');
    }
    return this.gamesService.submitGameCompletion(dto, vaccinatorId);
  }
}


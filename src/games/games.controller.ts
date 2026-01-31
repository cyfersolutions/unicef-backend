import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SubmitGameProgressDto } from './dto/submit-game-progress.dto';

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
}


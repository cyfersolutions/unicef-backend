import { Controller, Get, Param, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { SSEService } from './sse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Admin } from '../admins/entities/admin.entity';

@ApiTags('sse')
@Controller('sse')
export class SSEController {
  constructor(private readonly sseService: SSEService) {}

  @Get('events/:vaccinatorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'SSE endpoint for real-time updates (authenticated users)' })
  @ApiParam({ name: 'vaccinatorId', description: 'Vaccinator UUID' })
  async streamEvents(
    @Param('vaccinatorId') vaccinatorId: string,
    @CurrentUser() admin: Admin,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Subscribe to events
    const subscription = this.sseService.getEventStream(vaccinatorId).subscribe({
      next: (message) => {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      },
      error: (error) => {
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      },
      complete: () => {
        res.end();
      },
    });

    // Handle client disconnect
    req.on('close', () => {
      subscription.unsubscribe();
      this.sseService.removeEventStream(vaccinatorId);
      res.end();
    });
  }
}


import {
  Controller,
  Get,
  Param,
  Query,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { FindAllAuditLogsDto } from './dto/find-all-audit-logs.dto';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('superadmin')
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with filtering and pagination (superadmin only)' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin can access audit logs' })
  async findAll(@Query() query: FindAllAuditLogsDto) {
    const queryParams: any = { ...query };

    // Convert date strings to Date objects if provided
    if (query.startDate) {
      queryParams.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      queryParams.endDate = new Date(query.endDate);
    }

    return this.auditLogsService.findAll(queryParams);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get audit log statistics (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Audit log statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin can access statistics' })
  async getStatistics(@Query() query: GetStatisticsDto) {
    const queryParams: any = {};

    if (query.startDate) {
      queryParams.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      queryParams.endDate = new Date(query.endDate);
    }

    return this.auditLogsService.getStatistics(
      queryParams.startDate,
      queryParams.endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID (superadmin only)' })
  @ApiParam({ name: 'id', description: 'Audit log UUID' })
  @ApiResponse({ status: 200, description: 'Audit log found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin can access audit logs' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete old audit logs (superadmin only)' })
  @ApiQuery({ name: 'daysToKeep', required: false, description: 'Number of days to keep (default: 90)', type: Number })
  @ApiResponse({ status: 200, description: 'Old audit logs deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin can delete audit logs' })
  async cleanupOldLogs(@Query('daysToKeep') daysToKeep?: number) {
    const days = daysToKeep ? parseInt(daysToKeep.toString(), 10) : 90;
    const deletedCount = await this.auditLogsService.deleteOldLogs(days);
    return {
      message: `Deleted ${deletedCount} old audit logs`,
      deletedCount,
    };
  }
}


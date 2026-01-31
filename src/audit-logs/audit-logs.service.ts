import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, HttpMethod } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: AuditAction;
  method: HttpMethod;
  endpoint: string;
  requestBody?: string | null;
  responseBody?: string | null;
  statusCode: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  responseTimeMs?: number | null;
  error?: string | null;
}

export interface FindAllAuditLogsDto {
  page?: number;
  limit?: number;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action?: AuditAction;
  method?: HttpMethod;
  endpoint?: string;
  statusCode?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(query: FindAllAuditLogsDto = {}) {
    const {
      page = 1,
      limit = 50,
      userId,
      userEmail,
      userRole,
      action,
      method,
      endpoint,
      statusCode,
      startDate,
      endDate,
      search,
    } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    // Apply where conditions
    if (userId) {
      queryBuilder.andWhere('audit_log.user_id = :userId', { userId });
    }

    if (userEmail) {
      queryBuilder.andWhere('audit_log.user_email = :userEmail', { userEmail });
    }

    if (userRole) {
      queryBuilder.andWhere('audit_log.user_role = :userRole', { userRole });
    }

    if (action) {
      queryBuilder.andWhere('audit_log.action = :action', { action });
    }

    if (method) {
      queryBuilder.andWhere('audit_log.method = :method', { method });
    }

    if (endpoint) {
      queryBuilder.andWhere('audit_log.endpoint = :endpoint', { endpoint });
    }

    if (statusCode) {
      queryBuilder.andWhere('audit_log.status_code = :statusCode', { statusCode });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit_log.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('audit_log.created_at >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('audit_log.created_at <= :endDate', { endDate });
    }

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        `(audit_log.endpoint ILIKE :search OR audit_log.user_email ILIKE :search OR audit_log.error ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const auditLogs = await queryBuilder
      .orderBy('audit_log.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: auditLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
    });

    if (!auditLog) {
      throw new Error(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    if (startDate && endDate) {
      queryBuilder.where('audit_log.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.where('audit_log.created_at >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.where('audit_log.created_at <= :endDate', { endDate });
    }

    const [
      totalLogs,
      totalErrors,
      totalByAction,
      totalByMethod,
      topEndpoints,
      topUsers,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().where('audit_log.status_code >= :code', { code: 400 }).getCount(),
      queryBuilder
        .clone()
        .select('audit_log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.action')
        .getRawMany(),
      queryBuilder
        .clone()
        .select('audit_log.method', 'method')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.method')
        .getRawMany(),
      queryBuilder
        .clone()
        .select('audit_log.endpoint', 'endpoint')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.endpoint')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      queryBuilder
        .clone()
        .select('audit_log.user_email', 'userEmail')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.user_email IS NOT NULL')
        .groupBy('audit_log.user_email')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return {
      totalLogs,
      totalErrors,
      totalByAction,
      totalByMethod,
      topEndpoints,
      topUsers,
    };
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}


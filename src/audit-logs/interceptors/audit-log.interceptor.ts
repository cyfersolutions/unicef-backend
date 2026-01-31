import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditLogsService } from '../audit-logs.service';
import { AuditAction, HttpMethod } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract user information
    const user = (request as any).user;
    const userId = user?.id || null;
    const userEmail = user?.email || null;
    const userRole = user?.role?.name || null;

    // Extract request details
    const method = request.method as HttpMethod;
    const endpoint = request.url.split('?')[0]; // Remove query params
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('user-agent') || null;

    // Determine action based on HTTP method
    const action = this.getActionFromMethod(method);

    // Get request body (exclude sensitive fields)
    const requestBody = this.sanitizeRequestBody(request.body);

    // Handle response
    return next.handle().pipe(
      tap((responseData) => {
        const responseTime = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Get response body (limit size to avoid storing huge responses)
        const responseBody = this.sanitizeResponseBody(responseData);

        // Save audit log asynchronously (don't await to avoid blocking)
        this.auditLogsService
          .create({
            userId,
            userEmail,
            userRole,
            action,
            method,
            endpoint,
            requestBody,
            responseBody,
            statusCode,
            ipAddress,
            userAgent,
            responseTimeMs: responseTime,
            error: null,
          })
          .catch((error) => {
            // Log error but don't throw to avoid breaking the request
            console.error('Failed to save audit log:', error);
          });
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || 500;
        const errorMessage = error.message || 'Unknown error';

        // Save audit log with error
        this.auditLogsService
          .create({
            userId,
            userEmail,
            userRole,
            action,
            method,
            endpoint,
            requestBody,
            responseBody: null,
            statusCode,
            ipAddress,
            userAgent,
            responseTimeMs: responseTime,
            error: errorMessage,
          })
          .catch((logError) => {
            console.error('Failed to save audit log:', logError);
          });

        throw error;
      }),
    );
  }

  private getActionFromMethod(method: HttpMethod): AuditAction {
    switch (method) {
      case HttpMethod.POST:
        return AuditAction.CREATE;
      case HttpMethod.GET:
        return AuditAction.READ;
      case HttpMethod.PATCH:
      case HttpMethod.PUT:
        return AuditAction.UPDATE;
      case HttpMethod.DELETE:
        return AuditAction.DELETE;
      default:
        return AuditAction.OTHER;
    }
  }

  private getClientIp(request: Request): any {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return (
      request.ip ||
      request.socket.remoteAddress ||
      request.headers['x-real-ip'] ||
      'unknown'
    );
  }

  private sanitizeRequestBody(body: any): string | null {
    if (!body || Object.keys(body).length === 0) {
      return null;
    }

    // Create a copy to avoid modifying the original
    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    try {
      const jsonString = JSON.stringify(sanitized);
      // Limit size to 10KB
      return jsonString.length > 10000 ? jsonString.substring(0, 10000) + '...' : jsonString;
    } catch (error) {
      return '[Unable to serialize request body]';
    }
  }

  private sanitizeResponseBody(body: any): string | null {
    if (!body) {
      return null;
    }

    // If it's an error response, just store the message
    if (body instanceof Error) {
      return body.message;
    }

    // If it's a simple message response
    if (typeof body === 'string') {
      return body.length > 1000 ? body.substring(0, 1000) + '...' : body;
    }

    try {
      const jsonString = JSON.stringify(body);
      // Limit size to 50KB for responses
      return jsonString.length > 50000 ? jsonString.substring(0, 50000) + '...' : jsonString;
    } catch (error) {
      return '[Unable to serialize response body]';
    }
  }
}


import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserManagementGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const admin = request.user;

    if (!admin) {
      throw new ForbiddenException('Admin not authenticated');
    }

    const adminRole = admin.role?.name;

    // Superadmin has full access
    if (adminRole === 'superadmin') {
      return true;
    }

    // Admin needs USER_MANAGEMENT permission
    if (adminRole === 'admin') {
      const adminPermissions = admin.adminPermissions?.map(
        (ap: any) => ap.permission?.name,
      ) || [];

      if (!adminPermissions.includes('USER_MANAGEMENT')) {
        throw new ForbiddenException('Insufficient permissions. USER_MANAGEMENT permission required.');
      }

      return true;
    }

    throw new ForbiddenException('Only superadmin or admin with USER_MANAGEMENT permission can perform this action');
  }
}


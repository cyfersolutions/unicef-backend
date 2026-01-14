import { DataSource } from 'typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { Permission } from '../admins/entities/permission.entity';
import { AdminPermission } from '../admins/entities/admin-permission.entity';

export async function seedSuperAdminPermissions(dataSource: DataSource): Promise<void> {
  const adminRepository = dataSource.getRepository(Admin);
  const permissionRepository = dataSource.getRepository(Permission);
  const adminPermissionRepository = dataSource.getRepository(AdminPermission);

  // Find superadmin admin
  const superAdmin = await adminRepository.findOne({
    where: { email: 'superadmin@unicef.org' },
  });

  if (!superAdmin) {
    throw new Error('Superadmin admin not found. Please run super-admin seeder first.');
  }

  // Find "all" permission
  const allPermission = await permissionRepository.findOne({
    where: { name: 'all' },
  });

  if (!allPermission) {
    throw new Error('"all" permission not found. Please run permissions seeder first.');
  }

  // Check if superadmin already has "all" permission
  const existingPermission = await adminPermissionRepository
    .createQueryBuilder('ap')
    .where('ap.admin_id = :adminId', { adminId: superAdmin.id })
    .andWhere('ap.permission_id = :permissionId', { permissionId: allPermission.id })
    .getOne();

  if (existingPermission) {
    console.log('- Superadmin already has "all" permission');
    return;
  }

  // Create admin permission
  const adminPermission = adminPermissionRepository.create({
    admin: superAdmin,
    permission: allPermission,
  });

  await adminPermissionRepository.save(adminPermission);
  console.log(`✓ Assigned "all" permission to superadmin`);
}


import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admins/entities/admin.entity';
import { Role } from '../admins/entities/role.entity';

export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const adminRepository = dataSource.getRepository(Admin);
  const roleRepository = dataSource.getRepository(Role);

  // Find superadmin role
  const superAdminRole = await roleRepository.findOne({
    where: { name: 'superadmin' },
  });

  if (!superAdminRole) {
    throw new Error('Superadmin role not found. Please run roles seeder first.');
  }

  // Check if superadmin already exists
  const existingSuperAdmin = await adminRepository.findOne({
    where: { email: 'superadmin@unicef.org' },
  });

  if (existingSuperAdmin) {
    console.log('- Superadmin admin already exists');
    return;
  }

  // Default password for superadmin (should be changed on first login)
  const defaultPassword = 'SuperAdmin@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const superAdmin = adminRepository.create({
    name: 'Super Admin',
    email: 'superadmin@unicef.org',
    passwordHash,
    roleId: superAdminRole.id,
    isActive: true,
  });

  await adminRepository.save(superAdmin);
  console.log(`✓ Created superadmin admin: superadmin@unicef.org`);
  console.log(`  Default password: ${defaultPassword}`);
  console.log(`  ⚠️  Please change this password after first login!`);
}


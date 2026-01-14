import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedSuperAdmin } from './super-admin.seeder';
import { seedSuperAdminPermissions } from './admin-permissions.seeder';
import { seedStreaks } from './streaks.seeder';
import { seedDailyGoals } from './daily-goals.seeder';

export async function runSeeders(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seeders...\n');

  try {
    // Seed roles first
    console.log('📋 Seeding roles...');
    await seedRoles(dataSource);
    console.log('');

    // Seed permissions
    console.log('🔐 Seeding permissions...');
    await seedPermissions(dataSource);
    console.log('');

    // Seed super admin user
    console.log('👤 Seeding super admin user...');
    await seedSuperAdmin(dataSource);
    console.log('');

    // Seed super admin permissions
    console.log('🔑 Seeding super admin permissions...');
    await seedSuperAdminPermissions(dataSource);
    console.log('');

    // Seed streaks
    console.log('🔥 Seeding streaks...');
    await seedStreaks(dataSource);
    console.log('');

    // Seed daily goals
    console.log('🎯 Seeding daily goals...');
    await seedDailyGoals(dataSource);
    console.log('');

    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    throw error;
  }
}


import { DataSource } from 'typeorm';
import { Permission } from '../admins/entities/permission.entity';

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissions = [
    // System permissions
    { name: 'all', category: 'system' },
    
    // User/Admin management permissions
    { name: 'user:create', category: 'user' },
    { name: 'user:update', category: 'user' },
    { name: 'user:delete', category: 'user' },
    { name: 'user:read', category: 'user' },
    
    // Module permissions
    { name: 'module:create', category: 'module' },
    { name: 'module:update', category: 'module' },
    { name: 'module:delete', category: 'module' },
    { name: 'module:read', category: 'module' },
    
    // Unit permissions
    { name: 'unit:create', category: 'unit' },
    { name: 'unit:update', category: 'unit' },
    { name: 'unit:delete', category: 'unit' },
    { name: 'unit:read', category: 'unit' },
    
    // Lesson permissions
    { name: 'lesson:create', category: 'lesson' },
    { name: 'lesson:update', category: 'lesson' },
    { name: 'lesson:delete', category: 'lesson' },
    { name: 'lesson:read', category: 'lesson' },
    
    // Badge permissions
    { name: 'badge:create', category: 'badge' },
    { name: 'badge:update', category: 'badge' },
    { name: 'badge:delete', category: 'badge' },
    { name: 'badge:read', category: 'badge' },
    
    // Certificate permissions
    { name: 'certificate:create', category: 'certificate' },
    { name: 'certificate:update', category: 'certificate' },
    { name: 'certificate:delete', category: 'certificate' },
    { name: 'certificate:read', category: 'certificate' },
    
    // Streak permissions
    { name: 'streak:create', category: 'streak' },
    { name: 'streak:update', category: 'streak' },
    { name: 'streak:delete', category: 'streak' },
    { name: 'streak:read', category: 'streak' },
    
    // Daily Goal permissions
    { name: 'daily_goal:create', category: 'daily_goal' },
    { name: 'daily_goal:update', category: 'daily_goal' },
    { name: 'daily_goal:delete', category: 'daily_goal' },
    { name: 'daily_goal:read', category: 'daily_goal' },
    
    // Reward Rule permissions
    { name: 'reward_rule:create', category: 'reward_rule' },
    { name: 'reward_rule:update', category: 'reward_rule' },
    { name: 'reward_rule:delete', category: 'reward_rule' },
    { name: 'reward_rule:read', category: 'reward_rule' },
    
    // Daily Practice permissions
    { name: 'daily_practice:create', category: 'daily_practice' },
    { name: 'daily_practice:update', category: 'daily_practice' },
    { name: 'daily_practice:delete', category: 'daily_practice' },
    { name: 'daily_practice:read', category: 'daily_practice' },
    
    // XP Management permission (used by XPManagementGuard)
    { name: 'XP_MANAGEMENT', category: 'system' },
  ];

  for (const permissionData of permissions) {
    const existingPermission = await permissionRepository.findOne({
      where: { name: permissionData.name },
    });

    if (!existingPermission) {
      const permission = permissionRepository.create(permissionData);
      await permissionRepository.save(permission);
      console.log(`✓ Created permission: ${permissionData.name} (${permissionData.category})`);
    } else {
      console.log(`- Permission already exists: ${permissionData.name}`);
    }
  }
}


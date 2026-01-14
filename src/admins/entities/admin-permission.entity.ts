import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';
import { Permission } from './permission.entity';

@Entity('admin_permissions')
export class AdminPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Admin, (admin) => admin.adminPermissions)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @ManyToOne(() => Permission, (permission) => permission.adminPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}


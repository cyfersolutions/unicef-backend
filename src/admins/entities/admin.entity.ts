import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { AdminPermission } from './admin-permission.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'int', nullable: true, name: 'role_id' })
  roleId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column ({type:Boolean,default:true,name:'is_active'})
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.admins)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => AdminPermission, (adminPermission) => adminPermission.admin)
  adminPermissions: AdminPermission[];
}

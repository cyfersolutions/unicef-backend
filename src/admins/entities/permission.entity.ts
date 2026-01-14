import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdminPermission } from './admin-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({type:String,nullable:false,name:"category"})
  category: string;

  

  @OneToMany(() => AdminPermission, (adminPermission) => adminPermission.permission)
  adminPermissions: AdminPermission[];
}


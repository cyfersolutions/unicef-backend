import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @OneToMany(() => Admin, (admin) => admin.role)
  admins: Admin[];
}


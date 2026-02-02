import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('personal_info')
export class PersonalInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  cnic: string;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  province: string | null;

  @Column({ type: 'varchar', nullable: true })
  designation: string | null;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


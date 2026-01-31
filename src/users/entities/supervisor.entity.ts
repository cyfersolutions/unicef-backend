import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PersonalInfo } from './personal-info.entity';
import { Vaccinator } from './vaccinator.entity';

@Entity('supervisors')
export class Supervisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'detail_id' })
  detailId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToOne(() => PersonalInfo, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'detail_id' })
  personalInfo: PersonalInfo;

  @OneToMany(() => Vaccinator, (vaccinator) => vaccinator.supervisor)
  vaccinators: Vaccinator[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supervisor } from './supervisor.entity';
import { PersonalInfo } from './personal-info.entity';
import { VaccinatorSummary } from './vaccinator-summary.entity';

@Entity('vaccinators')
export class Vaccinator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'supervisor_id' })
  supervisorId: string | null;

  @Column({ type: 'uuid', nullable: false, name: 'detail_id' })
  detailId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.vaccinators, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor | null;

  @OneToOne(() => PersonalInfo, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'detail_id' })
  personalInfo: PersonalInfo;

  @OneToOne(() => VaccinatorSummary, (summary) => summary.vaccinator)
  summary: VaccinatorSummary | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


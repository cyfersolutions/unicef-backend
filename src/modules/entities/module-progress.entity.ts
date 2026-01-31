import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Module } from './module.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';
import { Unit } from '../../units/entities/unit.entity';

@Entity('module_progress')
@Index(['moduleId', 'vaccinatorId', 'attemptNumber'])
export class ModuleProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'module_id' })
  moduleId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 1, name: 'attempt_number' })
  attemptNumber: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'units_completed' })
  unitsCompleted: number;

  @Column({ type: 'uuid', nullable: true, name: 'current_unit_id' })
  currentUnitId: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false, default: 0, name: 'mastery_level' })
  masteryLevel: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'int', nullable: false, default: 0, name: 'xp_earned' })
  xpEarned: number;

  @Column({ type: 'timestamp', nullable: true, name: 'start_datetime' })
  startDatetime: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'end_datetime' })
  endDatetime: Date | null;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @ManyToOne(() => Unit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_unit_id' })
  currentUnit: Unit | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


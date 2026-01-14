import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true, name: 'order_no' })
  orderNo: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: false, name: 'unit_id' })
  unitId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'pass_threshold' })
  passThreshold: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'failed_threshold' })
  failedThreshold: number;

  @ManyToOne(() => Unit, (unit) => unit.lessons)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;
}


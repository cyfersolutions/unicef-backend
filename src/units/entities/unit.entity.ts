import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Module } from '../../modules/entities/module.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('units')
export class Unit {
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

  @Column({ type: 'uuid', nullable: false, name: 'module_id' })
  moduleId: string;

  @ManyToOne(() => Module, (module) => module.units)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @OneToMany(() => Lesson, (lesson) => lesson.unit)
  lessons: Lesson[];
}

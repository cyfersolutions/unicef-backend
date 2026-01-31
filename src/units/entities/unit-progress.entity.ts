import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Unit } from './unit.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('unit_progress')
@Index(['unitId', 'vaccinatorId', 'attemptNumber'])
export class UnitProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'unit_id' })
  unitId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 1, name: 'attempt_number' })
  attemptNumber: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'lessons_completed' })
  lessonsCompleted: number;

  @Column({ type: 'uuid', nullable: true, name: 'current_lesson_id' })
  currentLessonId: string | null;

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

  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @ManyToOne(() => Lesson, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_lesson_id' })
  currentLesson: Lesson | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


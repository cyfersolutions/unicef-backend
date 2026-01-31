import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vaccinator } from './vaccinator.entity';

@Entity('vaccinator_summary')
export class VaccinatorSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, unique: true, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 0, name: 'total_xp' })
  totalXp: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'total_badges' })
  totalBadges: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'total_certificates' })
  totalCertificates: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'modules_completed' })
  modulesCompleted: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'units_completed' })
  unitsCompleted: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'lessons_completed' })
  lessonsCompleted: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'questions_answered' })
  questionsAnswered: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'questions_correct' })
  questionsCorrect: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false, default: 0, name: 'overall_accuracy' })
  overallAccuracy: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'current_streak' })
  currentStreak: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'longest_streak' })
  longestStreak: number;

  @OneToOne(() => Vaccinator, (vaccinator) => vaccinator.summary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


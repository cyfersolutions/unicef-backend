import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Streak } from './streak.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('streak_progress')
@Index(['streakId', 'vaccinatorId', 'startDate'])
export class StreakProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'streak_id' })
  streakId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 0, name: 'current_streak_value' })
  currentStreakValue: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_achieved' })
  isAchieved: boolean;

  @Column({ type: 'boolean', nullable: false, default: true, name: 'in_progress' })
  inProgress: boolean;

  @Column({ type: 'date', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'last_achieved_date' })
  lastAchievedDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @ManyToOne(() => Streak, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streak_id' })
  streak: Streak;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


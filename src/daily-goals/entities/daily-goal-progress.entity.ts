import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DailyGoal } from './daily-goal.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('daily_goal_progress')
@Index(['goalId', 'vaccinatorId', 'startDate'])
export class DailyGoalProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'goal_id' })
  goalId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, name: 'goal_value' })
  goalValue: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'current_goal_value' })
  currentGoalValue: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_achieved' })
  isAchieved: boolean;

  @Column({ type: 'boolean', nullable: false, default: true, name: 'in_progress' })
  inProgress: boolean;

  @Column({ type: 'date', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @ManyToOne(() => DailyGoal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: DailyGoal;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


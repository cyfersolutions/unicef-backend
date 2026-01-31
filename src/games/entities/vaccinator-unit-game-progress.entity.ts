import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UnitGame } from './unit-game.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('vaccinator_unit_games_progress')
@Index(['unitGameId', 'vaccinatorId', 'attempt'])
@Index(['vaccinatorId', 'isCompleted'])
export class VaccinatorUnitGameProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'unit_game_id' })
  unitGameId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  score: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  attempt: number;

  @Column({ type: 'int', nullable: true })
  ratings: number | null;

  @Column({ type: 'jsonb', nullable: true, name: 'other_fields' })
  otherFields: Record<string, any> | null;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_passed' })
  isPassed: boolean;

  @Column({ type: 'int', nullable: false, default: 0, name: 'xp_earned' })
  xpEarned: number;

  @ManyToOne(() => UnitGame, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_game_id' })
  unitGame: UnitGame;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


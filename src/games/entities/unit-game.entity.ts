import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Game } from './game.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { VaccinatorUnitGameProgress } from './vaccinator-unit-game-progress.entity';

@Entity('unit_games')
@Index(['gameId', 'unitId'])
@Index(['unitId', 'lessonId'])
export class UnitGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'game_id' })
  gameId: string;

  @Column({ type: 'uuid', nullable: false, name: 'unit_id' })
  unitId: string;

  @Column({ type: 'uuid', nullable: false, name: 'lesson_id' })
  lessonId: string;

  @Column({ type: 'int', nullable: false, name: 'passing_score' })
  passingScore: number;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => VaccinatorUnitGameProgress, (vaccinatorUnitGameProgress) => vaccinatorUnitGameProgress.unitGame)
  vaccinatorUnitGameProgress: VaccinatorUnitGameProgress[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { LessonQuestion } from './lesson-question.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('lesson_question_progress')
@Index(['lessonQuestionId', 'vaccinatorId', 'attemptNumber'])
export class LessonQuestionProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'lesson_question_id' })
  lessonQuestionId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 1, name: 'attempt_number' })
  attemptNumber: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'int', nullable: false, default: 0, name: 'xp_earned' })
  xpEarned: number;

  @Column({ type: 'timestamp', nullable: true, name: 'start_datetime' })
  startDatetime: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'end_datetime' })
  endDatetime: Date | null;

  @ManyToOne(() => LessonQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_question_id' })
  lessonQuestion: LessonQuestion;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


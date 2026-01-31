import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';
import { LessonQuestion } from './lesson-question.entity';

@Entity('lesson_progress')
@Index(['lessonId', 'vaccinatorId', 'attemptNumber'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'lesson_id' })
  lessonId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'int', nullable: false, default: 1, name: 'attempt_number' })
  attemptNumber: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'questions_completed' })
  questionsCompleted: number;

  @Column({ type: 'uuid', nullable: true, name: 'current_question_id' })
  currentQuestionId: string | null;

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

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @ManyToOne(() => LessonQuestion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_question_id' })
  currentQuestion: LessonQuestion | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


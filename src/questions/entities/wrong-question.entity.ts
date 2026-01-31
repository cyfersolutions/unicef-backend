import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { LessonQuestion } from '../../lessons/entities/lesson-question.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('wrong_questions')
@Index(['lessonQuestionId', 'vaccinatorId'])
@Index(['vaccinatorId', 'createdAt'])
export class WrongQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'lesson_question_id' })
  lessonQuestionId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'timestamp', nullable: false, name: 'answered_at' })
  answeredAt: Date;

  @ManyToOne(() => LessonQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_question_id' })
  lessonQuestion: LessonQuestion;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}


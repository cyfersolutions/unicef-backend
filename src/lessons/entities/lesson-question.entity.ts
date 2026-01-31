import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('lesson_questions')
@Index(['lessonId', 'orderNo'], { unique: true })
export class LessonQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'lesson_id' })
  lessonId: string;

  @Column({ type: 'uuid', nullable: false, name: 'question_id' })
  questionId: string;

  @Column({ type: 'int', nullable: false, name: 'order_no' })
  orderNo: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.lessonQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}


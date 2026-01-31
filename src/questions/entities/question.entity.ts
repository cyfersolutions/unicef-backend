import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Persona } from '../../personas/entities/persona.entity';
import { QuestionType } from '../../common/enums/question-type.enum';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    nullable: false,
    name: 'question_type',
  })
  questionType: QuestionType;

  @Column({ type: 'text', nullable: true, name: 'question_text' })
  questionText: string | null;

  @Column({ type: 'text', nullable: true, name: 'question_image_url' })
  questionImageUrl: string | null;

  @Column({ type: 'text', nullable: true, name: 'question_audio_url' })
  questionAudioUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  options: any;

  @Column({ type: 'jsonb', nullable: true, name: 'correct_answer' })
  correctAnswer: any;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ type: 'int', nullable: true })
  xp: number | null;


  @Column({ type: 'uuid', nullable: true, name: 'persona_id' })
  personaId: string | null;

  @ManyToOne(() => Persona, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


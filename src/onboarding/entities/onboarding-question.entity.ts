import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OnboardingQuestionResponse } from './onboarding-question-response.entity';

@Entity('onboarding_questions')
export class OnboardingQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false, name: 'question_text' })
  questionText: string;

  @Column({ type: 'text', nullable: true, name: 'question_image' })
  questionImage: string | null;

  @Column({ type: 'jsonb', nullable: false })
  options: string[]; // Array of option strings

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => OnboardingQuestionResponse, (response) => response.question)
  responses: OnboardingQuestionResponse[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


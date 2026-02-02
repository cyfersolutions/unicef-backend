import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { OnboardingQuestion } from './onboarding-question.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('onboarding_questions_response')
@Index(['questionId', 'vaccinatorId'])
export class OnboardingQuestionResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'question_id' })
  questionId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'text', nullable: false })
  answer: string; // The selected option answer

  @Column({ type: 'timestamp', nullable: false, name: 'datetime' })
  datetime: Date;

  @ManyToOne(() => OnboardingQuestion, (question) => question.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: OnboardingQuestion;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}


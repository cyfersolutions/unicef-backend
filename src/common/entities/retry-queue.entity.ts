import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('retry_queue')
@Index(['status', 'createdAt'])
export class RetryQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  queueName: string;

  @Column({ type: 'jsonb', nullable: false })
  payload: any;

  @Column({ type: 'varchar', nullable: false, default: 'pending' })
  status: string; // pending, processing, failed, completed

  @Column({ type: 'int', nullable: false, default: 0, name: 'retry_count' })
  retryCount: number;

  @Column({ type: 'int', nullable: false, default: 3, name: 'max_retries' })
  maxRetries: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'processed_at' })
  processedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}


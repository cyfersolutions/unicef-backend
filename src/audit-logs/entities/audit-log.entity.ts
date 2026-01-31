import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  OTHER = 'OTHER',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['method', 'endpoint'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'user_email' })
  userEmail: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'user_role' })
  userRole: string | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
    nullable: false,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: HttpMethod,
    nullable: false,
  })
  method: HttpMethod;

  @Column({ type: 'varchar', nullable: false })
  endpoint: string;

  @Column({ type: 'text', nullable: true, name: 'request_body' })
  requestBody: string | null;

  @Column({ type: 'text', nullable: true, name: 'response_body' })
  responseBody: string | null;

  @Column({ type: 'int', nullable: false, name: 'status_code' })
  statusCode: number;

  @Column({ type: 'varchar', nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @Column({ type: 'varchar', nullable: true })
  error: string | null;

  @Column({ type: 'int', nullable: true, name: 'response_time_ms' })
  responseTimeMs: number | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}


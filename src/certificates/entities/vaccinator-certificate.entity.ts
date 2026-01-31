import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Vaccinator } from '../../users/entities/vaccinator.entity';

@Entity('vaccinator_certificates')
@Index(['certificateId', 'vaccinatorId'])
@Index(['vaccinatorId', 'date'])
export class VaccinatorCertificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'certificate_id' })
  certificateId: string;

  @Column({ type: 'uuid', nullable: false, name: 'vaccinator_id' })
  vaccinatorId: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @ManyToOne(() => Certificate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'certificate_id' })
  certificate: Certificate;

  @ManyToOne(() => Vaccinator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vaccinator_id' })
  vaccinator: Vaccinator;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}


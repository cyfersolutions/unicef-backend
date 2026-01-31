import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from './entities/certificate.entity';
import { VaccinatorCertificate } from './entities/vaccinator-certificate.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, VaccinatorCertificate, Vaccinator])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}

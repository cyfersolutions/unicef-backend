import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async create(createCertificateDto: CreateCertificateDto) {
    const certificate = this.certificateRepository.create(createCertificateDto);
    return await this.certificateRepository.save(certificate);
  }

  async findAll() {
    return await this.certificateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with id ${id} not found`);
    }

    return certificate;
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto) {
    await this.certificateRepository.update(id, updateCertificateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.certificateRepository.delete(id);
    return { message: 'Certificate deleted successfully' };
  }
}

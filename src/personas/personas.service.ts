import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) {}

  async create(createPersonaDto: CreatePersonaDto) {
    const persona = this.personaRepository.create(createPersonaDto);
    return await this.personaRepository.save(persona);
  }

  async findAll() {
    return await this.personaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const persona = await this.personaRepository.findOne({
      where: { id },
    });

    if (!persona) {
      throw new NotFoundException(`Persona with id ${id} not found`);
    }

    return persona;
  }

  async update(id: string, updatePersonaDto: UpdatePersonaDto) {
    await this.personaRepository.update(id, updatePersonaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.personaRepository.delete(id);
    return { message: 'Persona deleted successfully' };
  }
}


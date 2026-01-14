import { Injectable } from '@nestjs/common';
import { CreateDailyPracticeDto } from './dto/create-daily-practice.dto';
import { UpdateDailyPracticeDto } from './dto/update-daily-practice.dto';

@Injectable()
export class DailyPracticeService {
  create(createDailyPracticeDto: CreateDailyPracticeDto) {
    return 'This action adds a new dailyPractice';
  }

  findAll() {
    return `This action returns all dailyPractice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dailyPractice`;
  }

  update(id: number, updateDailyPracticeDto: UpdateDailyPracticeDto) {
    return `This action updates a #${id} dailyPractice`;
  }

  remove(id: number) {
    return `This action removes a #${id} dailyPractice`;
  }
}

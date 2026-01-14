import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DailyPracticeService } from './daily-practice.service';
import { CreateDailyPracticeDto } from './dto/create-daily-practice.dto';
import { UpdateDailyPracticeDto } from './dto/update-daily-practice.dto';

@Controller('daily-practice')
export class DailyPracticeController {
  constructor(private readonly dailyPracticeService: DailyPracticeService) {}

  @Post()
  create(@Body() createDailyPracticeDto: CreateDailyPracticeDto) {
    return this.dailyPracticeService.create(createDailyPracticeDto);
  }

  @Get()
  findAll() {
    return this.dailyPracticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyPracticeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyPracticeDto: UpdateDailyPracticeDto) {
    return this.dailyPracticeService.update(+id, updateDailyPracticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyPracticeService.remove(+id);
  }
}

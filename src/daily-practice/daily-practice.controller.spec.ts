import { Test, TestingModule } from '@nestjs/testing';
import { DailyPracticeController } from './daily-practice.controller';
import { DailyPracticeService } from './daily-practice.service';

describe('DailyPracticeController', () => {
  let controller: DailyPracticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyPracticeController],
      providers: [DailyPracticeService],
    }).compile();

    controller = module.get<DailyPracticeController>(DailyPracticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

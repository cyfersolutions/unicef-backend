import { Test, TestingModule } from '@nestjs/testing';
import { DailyGoalsController } from './daily-goals.controller';
import { DailyGoalsService } from './daily-goals.service';

describe('DailyGoalsController', () => {
  let controller: DailyGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyGoalsController],
      providers: [DailyGoalsService],
    }).compile();

    controller = module.get<DailyGoalsController>(DailyGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

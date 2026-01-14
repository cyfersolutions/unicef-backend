import { Test, TestingModule } from '@nestjs/testing';
import { DailyGoalsService } from './daily-goals.service';

describe('DailyGoalsService', () => {
  let service: DailyGoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyGoalsService],
    }).compile();

    service = module.get<DailyGoalsService>(DailyGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DailyPracticeService } from './daily-practice.service';

describe('DailyPracticeService', () => {
  let service: DailyPracticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyPracticeService],
    }).compile();

    service = module.get<DailyPracticeService>(DailyPracticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

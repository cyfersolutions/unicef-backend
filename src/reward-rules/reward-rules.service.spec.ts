import { Test, TestingModule } from '@nestjs/testing';
import { RewardRulesService } from './reward-rules.service';

describe('RewardRulesService', () => {
  let service: RewardRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardRulesService],
    }).compile();

    service = module.get<RewardRulesService>(RewardRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RewardRulesController } from './reward-rules.controller';
import { RewardRulesService } from './reward-rules.service';

describe('RewardRulesController', () => {
  let controller: RewardRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardRulesController],
      providers: [RewardRulesService],
    }).compile();

    controller = module.get<RewardRulesController>(RewardRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

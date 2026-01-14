import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardRulesService } from './reward-rules.service';
import { RewardRulesController } from './reward-rules.controller';
import { RewardRule } from './entities/reward-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RewardRule])],
  controllers: [RewardRulesController],
  providers: [RewardRulesService],
  exports: [RewardRulesService],
})
export class RewardRulesModule {}

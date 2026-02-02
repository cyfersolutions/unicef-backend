import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ModulesModule } from './modules/modules.module';
import { ValidatorsModule } from './common/validators/validators.module';
import { UnitsModule } from './units/units.module';
import { LessonsModule } from './lessons/lessons.module';
import { BadgesModule } from './badges/badges.module';
import { CertificatesModule } from './certificates/certificates.module';
import { RewardRulesModule } from './reward-rules/reward-rules.module';
import { DailyPracticeModule } from './daily-practice/daily-practice.module';
import { StreaksModule } from './streaks/streaks.module';
import { DailyGoalsModule } from './daily-goals/daily-goals.module';
import { PersonasModule } from './personas/personas.module';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { QueueModule } from './queue/queue.module';
import { RewardsModule } from './rewards/rewards.module';
import { SSEModule } from './sse/sse.module';
import { GamesModule } from './games/games.module';
import { UploadModule } from './upload/upload.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ValidatorsModule,
    AuthModule,
    AdminsModule,
    ModulesModule,
    UnitsModule,
    LessonsModule,
    BadgesModule,
    CertificatesModule,
    RewardRulesModule,
    DailyPracticeModule,
    StreaksModule,
    DailyGoalsModule,
    PersonasModule,
    QuestionsModule,
    UsersModule,
    AuditLogsModule,
    QueueModule,
    RewardsModule,
    SSEModule,
    GamesModule,
    UploadModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

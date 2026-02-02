import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { NeirService } from './services/neir.service';
import { RedisService } from './services/redis.service';
import { UsersModule } from '../users/users.module';
import { Admin } from '../admins/entities/admin.entity';
import { PersonalInfo } from '../users/entities/personal-info.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { Supervisor } from '../users/entities/supervisor.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Admin, PersonalInfo, Vaccinator, Supervisor]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtUserStrategy, NeirService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}

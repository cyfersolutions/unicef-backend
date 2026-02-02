import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../services/redis.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'vaccinator' | 'supervisor';
  type: 'vaccinator' | 'supervisor';
}

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
      passReqToCallback: true, // Enable access to request object
    });
  }

  async validate(req: any, payload: JwtPayload) {
    if (!payload.sub || !payload.type) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check if token is blacklisted
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type,
    };
  }
}


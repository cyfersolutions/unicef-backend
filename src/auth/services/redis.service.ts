import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly prefix = 'neir:token:';
  private readonly jwtBlacklistPrefix = 'jwt:blacklist:';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      username: this.configService.get<string>('REDIS_USERNAME'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis connected'));
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async setNeirToken(userId: string, token: string, ttl: number = 24 * 60 * 60): Promise<void> {
    const key = `${this.prefix}${userId}`;
    await this.client.setex(key, ttl, token);
  }

  async getNeirToken(userId: string): Promise<string | null> {
    const key = `${this.prefix}${userId}`;
    return await this.client.get(key);
  }

  async deleteNeirToken(userId: string): Promise<void> {
    const key = `${this.prefix}${userId}`;
    await this.client.del(key);
  }

  // JWT Token Blacklist Methods
  async addTokenToBlacklist(token: string, expirationTime: number): Promise<void> {
    // Calculate TTL: expirationTime is in seconds (JWT exp claim)
    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);
    const ttl = expirationTime - now;
    
    // Only add if token hasn't expired yet
    if (ttl > 0) {
      const key = `${this.jwtBlacklistPrefix}${token}`;
      await this.client.setex(key, ttl, '1');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.jwtBlacklistPrefix}${token}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  async removeTokenFromBlacklist(token: string): Promise<void> {
    const key = `${this.jwtBlacklistPrefix}${token}`;
    await this.client.del(key);
  }
}


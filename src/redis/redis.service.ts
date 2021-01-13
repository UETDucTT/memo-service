import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import * as Redis from 'ioredis';
import Redlock from 'redlock';
import { RedisClient, RedisClientError } from './redis-client.provider';

@Injectable()
export class RedisService {
  private redlocks: Map<string, any>;
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {
    this.redlocks = new Map();
  }

  getClient(name?: string): Redis.Redis {
    if (!name) {
      name = this.redisClient.defaultKey;
    }
    if (!this.redisClient.clients.has(name)) {
      throw new RedisClientError(`client ${name} does not exist`);
    }
    return this.redisClient.clients.get(name);
  }

  getLock(name?: string) {
    if (!name) {
      name = this.redisClient.defaultKey;
    }
    if (this.redlocks.has(name)) return this.redlocks.get(name);

    const lock = new Redlock([this.getClient(name)], {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: 0.01, // multiplied by lock ttl to determine drift time

      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount: 10,

      // the time in ms between attempts
      retryDelay: 200, // time in ms

      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://www.awsarchitectureblog.com/2015/03/backoff.html
      retryJitter: 200, // time in ms
    });
    this.redlocks.set(name, lock);
    return lock;
  }

  getClients(): Map<string, Redis.Redis> {
    return this.redisClient.clients;
  }
}

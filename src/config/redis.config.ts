import { registerAs } from '@nestjs/config';
import getEnvVarOrDie from './helpers';

export interface RedisConfig {
  mainUrl: string;
}

export default registerAs(
  'redis',
  (): RedisConfig => ({
    mainUrl: getEnvVarOrDie('REDIS_URL'),
  }),
);

import { registerAs } from '@nestjs/config';
import getEnvVarOrDie from './helpers';

export interface IdentityConfig {
  jwtSecretKey: string;
}

export default registerAs(
  'identity',
  (): IdentityConfig => ({
    jwtSecretKey: getEnvVarOrDie('JWT_SECRET_KEY'),
  }),
);

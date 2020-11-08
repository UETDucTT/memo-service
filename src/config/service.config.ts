import { registerAs } from '@nestjs/config';
import getEnvVarOrDie from './helpers';

export interface ServiceConfig {
  domainClient: string;
  mailHost: string;
  mailPort: number;
  mailUser: string;
  mailPass: string;
}

export default registerAs(
  'service',
  (): ServiceConfig => ({
    domainClient: getEnvVarOrDie('DOMAIN_CLIENT'),
    mailHost: getEnvVarOrDie('MAIL_HOST'),
    mailPort: parseInt(getEnvVarOrDie('MAIL_PORT')),
    mailUser: getEnvVarOrDie('MAIL_USER'),
    mailPass: getEnvVarOrDie('MAIL_PASS'),
  }),
);

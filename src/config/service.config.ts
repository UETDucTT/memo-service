import { registerAs } from '@nestjs/config';
import getEnvVarOrDie from './helpers';

export interface ServiceConfig {
  domainClient: string;
  mailHost: string;
  mailPort: number;
  mailUser: string;
  mailPass: string;
  limitLogin: boolean;
  maxSizeUpload: number;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3Endpoint: string;
  bucketName: string;
  mailgunDomain: string;
  mailgunKey: string;
}

export default registerAs(
  'service',
  (): ServiceConfig => ({
    domainClient: getEnvVarOrDie('DOMAIN_CLIENT'),
    mailHost: getEnvVarOrDie('MAIL_HOST'),
    mailPort: parseInt(getEnvVarOrDie('MAIL_PORT')),
    mailUser: getEnvVarOrDie('MAIL_USER'),
    mailPass: getEnvVarOrDie('MAIL_PASS'),
    limitLogin: getEnvVarOrDie('LIMIT_LOGIN') === 'true',
    s3AccessKeyId: getEnvVarOrDie('S3_ACCESS_KEY_ID'),
    s3SecretAccessKey: getEnvVarOrDie('S3_SECRET_ACCESS_KEY'),
    s3Endpoint: getEnvVarOrDie('S3_ENDPOINT'),
    bucketName: getEnvVarOrDie('BUCKET_NAME'),
    maxSizeUpload: Number(getEnvVarOrDie('MAX_SIZE_UPLOAD')),
    mailgunDomain: getEnvVarOrDie('MAILGUN_DOMAIN'),
    mailgunKey: getEnvVarOrDie('MAILGUN_KEY'),
  }),
);

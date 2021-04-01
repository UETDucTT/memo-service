import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import identityConfig from './config/identity.config';
import serviceConfig from './config/service.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DiaryModule } from './diary/diary.module';
import { ResourceModule } from './resource/resource.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NotificationModule } from './notification/notification.module';
import { PreviewLinkModule } from './link-preview/link-preview.module';
import { TagModule } from './tag/tag.module';
import { RedisModule } from './redis/redis.module';
import { DiaryShareModule } from './diary-share/diary-share.module';
import { CategoryModule } from './category/category.module';
import { CrawlConfigModule } from './crawl-config/config.module';
import { ArticleModule } from './article/article.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/memo', {
      connectionFactory: connection => {
        connection.plugin(require('mongoose-paginate-v2'));
        return connection;
      },
    }),
    ConfigModule.forRoot({
      load: [serviceConfig, identityConfig],
    }),
    NotificationModule,
    HealthModule,
    AuthModule,
    DiaryModule,
    ResourceModule,
    PreviewLinkModule,
    TagModule,
    DiaryShareModule,
    CategoryModule,
    CrawlConfigModule,
    ArticleModule,
    UploadModule,
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'main',
          url: configService.get<string>('redis.mainUrl'),
        },
      ],
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('service.mailHost');
        const port = configService.get<number>('service.mailPort');
        const user = configService.get<string>('service.mailUser');
        const pass = configService.get<string>('service.mailPass');

        return {
          transport: {
            host,
            port: 587,
            secure: false,
            // pool: true,
            tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false,
            },
            auth: {
              user,
              pass,
            },
          },
          template: {
            dir: process.cwd() + '/template/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigService],
})
export class AppModule {}

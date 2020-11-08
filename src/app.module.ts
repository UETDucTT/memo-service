import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import identityConfig from './config/identity.config';
import serviceConfig from './config/service.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DiaryModule } from './diary/diary.module';
import { ResourceModule } from './resource/resource.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot({
      load: [serviceConfig, identityConfig],
    }),
    HealthModule,
    AuthModule,
    DiaryModule,
    ResourceModule,
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('service.mailHost'),
          port: configService.get<number>('service.mailPort'),
          secure: true,
          auth: {
            user: configService.get<string>('service.mailUser'),
            pass: configService.get<string>('service.mailPass'),
          },
        },
        template: {
          dir: process.cwd() + '/template/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigService],
})
export class AppModule {}

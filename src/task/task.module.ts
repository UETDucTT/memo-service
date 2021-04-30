import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ArticleModule } from 'src/article/article.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { CrawlConfigModule } from 'src/crawl-config/config.module';
import { NotificationModule } from 'src/notification/notification.module';
// import { NotificationGateway } from 'src/notification/notification.gateway';
import { TaskService } from './task.service';
import { MailgunModule } from '@nextnm/nestjs-mailgun';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => CrawlConfigModule),
    forwardRef(() => ArticleModule),
    MailgunModule.forAsyncRoot({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          DOMAIN: configService.get<string>('service.mailgunDomain'),
          API_KEY: configService.get<string>('service.mailgunKey'),
        };
      },
    }),
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}

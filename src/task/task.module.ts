import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticleModule } from 'src/article/article.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { CrawlConfigModule } from 'src/crawl-config/config.module';
import { NotificationModule } from 'src/notification/notification.module';
// import { NotificationGateway } from 'src/notification/notification.gateway';
import { TaskService } from './task.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => CrawlConfigModule),
    forwardRef(() => ArticleModule),
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}

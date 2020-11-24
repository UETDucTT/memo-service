import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { TaskService } from './task.service';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [TaskService, NotificationGateway],
  exports: [TaskService],
})
export class TaskModule {}

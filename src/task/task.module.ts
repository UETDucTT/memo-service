import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
// import { NotificationGateway } from 'src/notification/notification.gateway';
import { TaskService } from './task.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}

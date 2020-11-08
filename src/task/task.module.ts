import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskService } from './task.service';

@Module({
  imports: [ConfigModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}

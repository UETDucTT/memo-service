import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './diary.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { TaskModule } from 'src/task/task.module';
import { TagModule } from 'src/tag/tag.module';
import { DiaryShareModule } from 'src/diary-share/diary-share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diary]),
    IdentityModule,
    forwardRef(() => AuthModule),
    forwardRef(() => TaskModule),
    forwardRef(() => TagModule),
    forwardRef(() => DiaryShareModule),
  ],
  exports: [DiaryService],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IdentityMiddleware)
      .exclude({
        path: 'diaries/public/:id',
        method: RequestMethod.GET,
      })
      .forRoutes(DiaryController);
  }
}

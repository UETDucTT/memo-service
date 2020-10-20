import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './diary.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Diary]), IdentityModule, AuthModule],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes('diaries');
  }
}

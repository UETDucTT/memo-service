import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryModule } from 'src/diary/diary.module';
import { DiaryShare } from './diary-share.entity';
import { DiaryShareService } from './diary-share.service';

@Module({
  imports: [
    forwardRef(() => DiaryModule),
    TypeOrmModule.forFeature([DiaryShare]),
  ],
  controllers: [],
  providers: [DiaryShareService],
  exports: [DiaryShareService],
})
export class DiaryShareModule {}

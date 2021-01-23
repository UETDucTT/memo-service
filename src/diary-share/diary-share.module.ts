import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryShare } from './diary-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiaryShare])],
  controllers: [],
  providers: [],
})
export class DiaryShareModule {}

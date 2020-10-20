import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryResource } from './resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiaryResource])],
  controllers: [],
  providers: [],
})
export class ResourceModule {}

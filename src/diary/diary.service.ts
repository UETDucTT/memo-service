import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDiaryDto } from './diary.dto';
import { Diary } from './diary.entity';
import { DiaryResource } from '../resource/resource.entity';
import { User } from 'src/auth/auth.entity';

type CreateDiaryDtoWithUser = CreateDiaryDto & {
  user: User;
};

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepo: Repository<Diary>,
    @InjectRepository(Diary)
    private readonly diaryResourceRepo: Repository<DiaryResource>,
  ) {}

  async create(params: CreateDiaryDtoWithUser) {
    return await this.diaryRepo.save(params);
  }
}

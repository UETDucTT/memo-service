import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { CreateDiaryDto, SearchDiaryDto } from './diary.dto';
import { Diary } from './diary.entity';
import { DiaryResource } from '../resource/resource.entity';
import { User } from 'src/auth/auth.entity';
import { addDays } from 'date-fns';

type CreateDiaryDtoWithUser = CreateDiaryDto & {
  user: User;
};

type SearchDiaryDtoWithUser = SearchDiaryDto & {
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

  async getList(params: SearchDiaryDtoWithUser) {
    const { page, pageSize, q, fromDate, toDate, user } = params;
    let betweenCondition = {};
    if (fromDate && toDate) {
      betweenCondition = {
        createdAt: Between(new Date(fromDate), new Date(toDate)),
      };
    } else if (fromDate) {
      betweenCondition = {
        createdAt: Between(new Date(fromDate), addDays(new Date(), 1)),
      };
    } else if (toDate) {
      betweenCondition = {
        createdAt: Between(new Date(0), new Date(toDate)),
      };
    }
    return await this.diaryRepo.findAndCount({
      where: {
        user: {
          id: user.id,
        },
        title: Like(`%${q || ''}%`),
        ...betweenCondition,
      },
      relations: ['resources'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }
}

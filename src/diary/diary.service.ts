import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getById(id: string) {
    const diary = await this.diaryRepo.findOne({
      where: { id },
      relations: ['resources'],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    return diary;
  }

  buildParams(params: SearchDiaryDtoWithUser) {
    let { page, pageSize, q, fromDate, toDate, user, lastId } = params;
    if (!lastId && !page) {
      page = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }
    return {
      page,
      pageSize,
      q,
      fromDate,
      toDate,
      user,
      lastId,
    };
  }

  async getList(params: SearchDiaryDtoWithUser) {
    const {
      page,
      pageSize,
      q,
      fromDate,
      toDate,
      user,
      lastId,
    } = this.buildParams(params);
    console.log(page, pageSize, q, fromDate, toDate, user, lastId);
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
    if (page) {
      const result = await this.diaryRepo.findAndCount({
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
      const [next] = await this.diaryRepo.findAndCount({
        where: {
          user: {
            id: user.id,
          },
          title: Like(`%${q || ''}%`),
          ...betweenCondition,
        },
        skip: page * pageSize,
        take: 1,
        order: { createdAt: 'DESC' },
      });
      const hasMore = !!next.length;
      return {
        result,
        hasMore,
      };
    } else {
      const allElement = await this.diaryRepo.find({
        where: {
          user: {
            id: user.id,
          },
          title: Like(`%${q || ''}%`),
          ...betweenCondition,
        },
        order: { createdAt: 'DESC' },
      });
      const idx = allElement.findIndex(el => el.id === lastId);
      if (idx !== -1) {
        const result = await this.diaryRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
          },
          relations: ['resources'],
          skip: idx + 1,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.diaryRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
          },
          skip: idx + 1 + pageSize,
          take: 1,
          order: { createdAt: 'DESC' },
        });
        const hasMore = !!next.length;
        return {
          result,
          hasMore,
        };
      } else {
        const result = await this.diaryRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
          },
          relations: ['resources'],
          skip: 0,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.diaryRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
          },
          skip: pageSize,
          take: 1,
          order: { createdAt: 'DESC' },
        });
        const hasMore = !!next.length;
        return {
          result,
          hasMore,
        };
      }
    }
  }
}

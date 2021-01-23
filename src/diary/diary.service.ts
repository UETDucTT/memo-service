import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import {
  CreateDiaryDto,
  SearchDiaryDto,
  EditDiaryDto,
  TriggerSandEmailDto,
} from './diary.dto';
import { Diary, Status } from './diary.entity';
import { User } from 'src/auth/auth.entity';
import { addDays, maxTime } from 'date-fns';
import { TagService } from 'src/tag/tag.service';
import { TaskService } from 'src/task/task.service';
import { DiaryShareService } from 'src/diary-share/diary-share.service';

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
    @Inject(forwardRef(() => DiaryShareService))
    private readonly diaryShareService: DiaryShareService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
  ) {}

  async getSummaryDiaries(userId: number, params: SearchDiaryDto) {
    const { q, fromDate, toDate, tag } = params;
    let betweenCondition = {};

    let inCondition = {};

    if (tag) {
      inCondition = {
        ...inCondition,
        tag: In(tag),
      };
    }
    if (fromDate && toDate) {
      betweenCondition = {
        time: Between(new Date(fromDate), new Date(toDate)),
      };
    } else if (fromDate) {
      betweenCondition = {
        time: Between(new Date(fromDate), new Date(maxTime)),
      };
    } else if (toDate) {
      betweenCondition = {
        time: Between(new Date(0), new Date(toDate)),
      };
    }

    const totalDiaries = await this.diaryRepo.count({
      where: { user: { id: userId } },
    });
    const currentDiaries = await this.diaryRepo.count({
      where: [
        {
          user: { id: userId },
          title: Like(`%${q || ''}%`),
          ...betweenCondition,
          ...inCondition,
        },
        {
          user: { id: userId },
          content: Like(`%${q || ''}%`),
          ...betweenCondition,
          ...inCondition,
        },
      ],
    });
    const totalDiariesToday = await this.diaryRepo.count({
      where: {
        user: { id: userId },
        time: Between(new Date(), addDays(new Date(), 1)),
      },
    });
    return {
      total: totalDiaries,
      current: currentDiaries,
      today: totalDiariesToday,
    };
  }

  async create(params: CreateDiaryDtoWithUser) {
    const { tagId, ...rest } = params;
    const diary = new Diary();
    if (tagId === null || tagId) {
      const currTag = await this.tagService.getTag({ id: tagId });
      if (tagId && !currTag) {
        throw new NotFoundException(`Tag with id ${tagId} not found`);
      }
      if (currTag) {
        diary.tag = currTag;
      } else {
        diary.tag = null;
      }
    }
    this.diaryRepo.merge(diary, rest);
    return await this.diaryRepo.save(diary);
  }

  async update(id: string, userId: string, params: EditDiaryDto) {
    const { tagId, ...rest } = params;
    const diary = await this.diaryRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['resources', 'tag', 'links'],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    if (rest.resources) {
      diary.resources = [];
    }

    if (rest.links) {
      diary.links = [];
    }

    if (tagId === null || tagId) {
      const currTag = await this.tagService.getTag({ id: tagId });
      if (tagId && !currTag) {
        throw new NotFoundException(`Tag with id ${tagId} not found`);
      }
      if (currTag) {
        diary.tag = currTag;
      } else {
        diary.tag = null;
      }
    }
    this.diaryRepo.merge(diary, rest);
    await this.diaryRepo.save(diary);
    return diary.id;
  }

  async getById(id: string, userId: number) {
    const diary = await this.diaryRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['resources', 'user', 'tag', 'links', 'shares'],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    return diary;
  }

  async getPublicById(id: string) {
    const diary = await this.diaryRepo.findOne({
      where: { id, status: Status.public },
      relations: ['resources', 'user', 'tag', 'links'],
    });
    if (!diary) {
      throw new NotFoundException(
        `Diary with id ${id} not found or non-public`,
      );
    }
    return diary;
  }

  async deleteById(id: string, userId: string): Promise<string> {
    const diary = await this.diaryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    await this.diaryRepo.remove(diary);
    return id;
  }

  buildParams(params: SearchDiaryDtoWithUser) {
    let { page, pageSize, q, fromDate, toDate, user, lastId, ...rest } = params;
    if (!lastId && !page) {
      page = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }
    return {
      ...rest,
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
      emotion,
      tag,
    } = this.buildParams(params);
    let betweenCondition = {};

    let inCondition = {};

    if (emotion) {
      inCondition = {
        ...inCondition,
        emotion: In(emotion),
      };
    }
    if (tag) {
      inCondition = {
        ...inCondition,
        tag: In(tag),
      };
    }

    if (fromDate && toDate) {
      betweenCondition = {
        time: Between(new Date(fromDate), new Date(toDate)),
      };
    } else if (fromDate) {
      betweenCondition = {
        time: Between(new Date(fromDate), new Date(maxTime)),
      };
    } else if (toDate) {
      betweenCondition = {
        time: Between(new Date(0), new Date(toDate)),
      };
    }
    if (page) {
      const result = await this.diaryRepo.findAndCount({
        where: [
          {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
          {
            user: {
              id: user.id,
            },
            content: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
        ],
        relations: ['resources', 'tag', 'links'],
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { createdAt: 'DESC' },
      });
      const [next] = await this.diaryRepo.findAndCount({
        where: [
          {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
          {
            user: {
              id: user.id,
            },
            content: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
        ],
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
        where: [
          {
            user: {
              id: user.id,
            },
            title: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
          {
            user: {
              id: user.id,
            },
            content: Like(`%${q || ''}%`),
            ...betweenCondition,
            ...inCondition,
          },
        ],
        order: { createdAt: 'DESC' },
      });
      const idx = allElement.findIndex(el => el.id === lastId);
      if (idx !== -1) {
        const result = await this.diaryRepo.findAndCount({
          where: [
            {
              user: {
                id: user.id,
              },
              title: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
            {
              user: {
                id: user.id,
              },
              content: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
          ],
          relations: ['resources', 'tag', 'links'],
          skip: idx + 1,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.diaryRepo.findAndCount({
          where: [
            {
              user: {
                id: user.id,
              },
              title: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
            {
              user: {
                id: user.id,
              },
              content: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
          ],
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
          where: [
            {
              user: {
                id: user.id,
              },
              title: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
            {
              user: {
                id: user.id,
              },
              content: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
          ],
          relations: ['resources', 'tags', 'links'],
          skip: 0,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.diaryRepo.findAndCount({
          where: [
            {
              user: {
                id: user.id,
              },
              title: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
            {
              user: {
                id: user.id,
              },
              content: Like(`%${q || ''}%`),
              ...betweenCondition,
              ...inCondition,
            },
          ],
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

  async shareDiary(triggleSendEmailDto: TriggerSandEmailDto, user: User) {
    const diary = await this.getById(triggleSendEmailDto.id, user.id);
    if (diary.status !== Status.public) {
      throw new BadRequestException('Diary non-public');
    }
    await this.diaryShareService.bulkCreate(
      triggleSendEmailDto.emails.map(el => ({
        email: el,
        diary,
      })),
    );
    this.taskService.sendEmailShareDiary(
      diary,
      triggleSendEmailDto.emails.filter(el => el !== user.email),
    );
  }

  async getAllDiaryOfUser(userId: number) {
    return this.diaryRepo.find({ where: { user: { id: userId } } });
  }
}

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDiaryDto,
  SearchDiaryDto,
  EditDiaryDto,
  TriggerSandEmailDto,
} from './diary.dto';
import { Status } from './diary.entity';
import { addDays, maxTime } from 'date-fns';
import { TagService } from 'src/tag/tag.service';
import { TaskService } from 'src/task/task.service';
import { DiaryShareService } from 'src/diary-share/diary-share.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Diary as DiaryMongo, DiaryDocument } from './diary.schema';

type CreateDiaryDtoWithUser = CreateDiaryDto & {
  user: string;
};

type SearchDiaryDtoWithUser = SearchDiaryDto & {
  user: string;
};

@Injectable()
export class DiaryService {
  constructor(
    @Inject(forwardRef(() => DiaryShareService))
    private readonly diaryShareService: DiaryShareService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
    @InjectModel(DiaryMongo.name)
    private diaryModel: Model<DiaryDocument>,
  ) {}

  async getSummaryDiaries(userId: string, params: SearchDiaryDto) {
    const { q, fromDate, toDate, tag, pinned } = params;
    let betweenCondition = {};

    let inCondition = {};

    if (tag) {
      inCondition = {
        tags: { $in: tag },
      };
    }

    if (fromDate && toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };
    } else if (fromDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(maxTime),
        },
      };
    } else if (toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(0),
          $lte: new Date(toDate),
        },
      };
    }

    let pinnedCondition = {};
    if (pinned !== undefined) {
      if (pinned) {
        pinnedCondition = {
          pinned: true,
        };
      } else {
        pinnedCondition = {
          pinned: { $ne: true },
        };
      }
    }

    const totalDiaries = await this.diaryModel
      .find({ user: userId })
      .countDocuments()
      .exec();

    const currentDiaries = await this.diaryModel
      .find({
        $and: [
          { user: userId },
          { ...pinnedCondition },
          { ...betweenCondition },
          { ...inCondition },
          {
            $or: [
              {
                title: { $regex: `.*${q || ''}.*`, $options: 'i' },
              },
              {
                content: { $regex: `.*${q || ''}.*`, $options: 'i' },
              },
            ],
          },
        ],
      })
      .countDocuments()
      .exec();
    const totalDiariesToday = await this.diaryModel
      .find({
        $and: [
          { user: userId },
          {
            time: {
              $gte: new Date(),
              $lte: addDays(new Date(), 1),
            },
          },
        ],
      })
      .countDocuments()
      .exec();
    return {
      total: totalDiaries,
      current: currentDiaries,
      today: totalDiariesToday,
    };
  }

  async create(params: CreateDiaryDtoWithUser) {
    const { tagIds, ...rest } = params;
    const tags = [];
    if (tagIds?.length) {
      for (let i = 0; i < tagIds.length; i++) {
        const currTag = await this.tagService.getTag({
          $and: [{ _id: tagIds[i] }, { user: rest.user }],
        });
        if (!currTag) {
          throw new NotFoundException(`Tag with id ${tagIds[i]} not found`);
        }
        tags.push(tagIds[i]);
      }
    }
    const diaryObj = new this.diaryModel({ ...rest, tags });
    const diary = await diaryObj.save();
    return diary;
  }

  async update(id: string, userId: string, params: EditDiaryDto) {
    const { tagIds, ...rest } = params;
    const diary = await this.diaryModel
      .findOne({
        $and: [{ _id: id }, { user: userId }],
      })
      .exec();
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    if (rest.resources) {
      diary.resources = [];
    }

    if (rest.links) {
      diary.links = [];
    }

    const tags = [];
    if (Array.isArray(tagIds)) {
      for (let i = 0; i < tagIds.length; i++) {
        const currTag = await this.tagService.getTag({
          $and: [{ _id: tagIds[i] }, { user: userId }],
        });
        if (!currTag) {
          throw new NotFoundException(`Tag with id ${tagIds[i]} not found`);
        }
        tags.push(tagIds[i]);
      }
    }

    await this.diaryModel.findOneAndUpdate(
      { _id: id },
      {
        ...rest,
        tags,
      } as any,
      {
        strict: false,
      },
    );
    return diary.id;
  }

  async getById(id: string, userId: string) {
    const diary = await this.diaryModel
      .findOne({ $and: [{ _id: id }, { user: userId }] })
      .populate('tags')
      .populate('user', '-password')
      .exec();
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    return diary;
  }

  async getPublicById(id: string) {
    const diary = await this.diaryModel
      .findOne({ $and: [{ _id: id }, { status: Status.public }] })
      .populate('tags')
      .populate('user', '-password')
      .exec();
    if (!diary) {
      throw new NotFoundException(
        `Diary with id ${id} not found or non-public`,
      );
    }
    return diary;
  }

  async deleteById(id: string, userId: string): Promise<string> {
    const diary = await this.diaryModel.findOne({
      $and: [{ _id: id }, { user: userId }],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    await diary.remove();
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
      tag,
      pinned,
    } = this.buildParams(params);
    let betweenCondition = {};

    let inCondition = {};

    let pinnedCondition = {};
    if (pinned !== undefined) {
      if (pinned) {
        pinnedCondition = {
          pinned: true,
        };
      } else {
        pinnedCondition = {
          pinned: { $ne: true },
        };
      }
    }
    if (tag) {
      inCondition = {
        tags: { $in: tag },
      };
    }

    if (fromDate && toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };
    } else if (fromDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(maxTime),
        },
      };
    } else if (toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(0),
          $lte: new Date(toDate),
        },
      };
    }

    const whereQuery = {
      $and: [
        { user },
        { ...pinnedCondition },
        { ...betweenCondition },
        { ...inCondition },
        {
          $or: [
            {
              title: { $regex: `.*${q || ''}.*`, $options: 'i' },
            },
            {
              content: { $regex: `.*${q || ''}.*`, $options: 'i' },
            },
          ],
        },
      ],
    };

    if (!lastId) {
      const result = await (this.diaryModel as any).paginate(whereQuery, {
        page,
        limit: pageSize,
        populate: 'tags',
        sort: '-createdAt',
      });
      return result;
    } else {
      const allElements = await this.diaryModel
        .find(whereQuery)
        .sort('-createdAt')
        .exec();
      const idx = allElements.findIndex(el => el.id === lastId);
      return await (this.diaryModel as any).paginate(whereQuery, {
        offset: idx + 1,
        limit: pageSize,
        populate: 'tags',
        sort: '-createdAt',
      });
    }
  }

  async shareDiary(triggleSendEmailDto: TriggerSandEmailDto, user: any) {
    const diary = await this.diaryModel
      .findOne({
        $and: [{ _id: triggleSendEmailDto.id }, { user: user.id }],
      })
      .populate('user');
    if (!diary || diary.status !== Status.public) {
      throw new BadRequestException(
        `Diary with id ${triggleSendEmailDto.id} not found or non-public`,
      );
    }
    await this.diaryShareService.bulkCreate(
      triggleSendEmailDto.emails.map(el => ({
        email: el,
        diary: diary.id,
      })),
    );
    this.taskService.sendEmailShareDiary(
      diary as any,
      triggleSendEmailDto.emails.filter(el => el !== user.email),
    );
  }

  async getAllDiaryOfUser(userId: string) {
    return await this.diaryModel.find({ user: userId }).exec();
  }
}

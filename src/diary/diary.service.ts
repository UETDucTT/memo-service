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
  TriggerShareDiaryDto,
  ShareDiariesDto,
} from './diary.dto';
import { Status } from './diary.entity';
import { addDays, maxTime } from 'date-fns';
import { TagService } from 'src/tag/tag.service';
import { TaskService } from 'src/task/task.service';
import { DiaryShareService } from 'src/diary-share/diary-share.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Diary as DiaryMongo, DiaryDocument } from './diary.schema';
import { AuthService } from 'src/auth/auth.service';
import mongoose from 'mongoose';

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
    @Inject(forwardRef(() => AuthService))
    private userService: AuthService,
    @InjectModel(DiaryMongo.name)
    private diaryModel: Model<DiaryDocument>,
  ) {}

  async getSummaryDiaries(
    userId: string,
    params: SearchDiaryDto,
    startDateToday: Date,
  ) {
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
              $gte: startDateToday,
              $lte: addDays(startDateToday, 1),
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

  async getShareById(id: string, receiverId: string) {
    const shares = await this.diaryShareService.find({
      record: id,
      receiver: receiverId,
    });
    if (!shares.length) {
      throw new NotFoundException(`Diary with id ${id} non-public`);
    }
    const diary = await this.diaryModel
      .findOne({ $and: [{ _id: id }] })
      .populate('tags')
      .populate('user', '-password')
      .exec();
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    const action = shares[0].action;
    return { diary, action };
  }

  async updateSharedRecord(id: string, userId: string, params: EditDiaryDto) {
    const shares = await this.diaryShareService.find({
      record: id,
      receiver: userId,
      action: 'edit',
    });
    if (!shares.length) {
      throw new BadRequestException(`Disallow update record with id: ${id}`);
    }
    const diary = await this.diaryModel
      .findOne({ $and: [{ _id: id }] })
      .populate('tags')
      .populate('user', '-password')
      .exec();
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    const { tagIds, ...rest } = params;
    if (rest.resources) {
      diary.resources = [];
    }

    if (rest.links) {
      diary.links = [];
    }

    await this.diaryModel.findOneAndUpdate(
      { _id: id },
      {
        ...rest,
      } as any,
      {
        strict: false,
      },
    );
    return diary.id;
  }

  async deleteShareById(id: string, userId: string): Promise<string> {
    const shares = await this.diaryShareService.find({
      record: id,
      receiver: userId,
      action: 'edit',
    });
    if (!shares.length) {
      throw new BadRequestException(`Disallow delete record with id: ${id}`);
    }
    const diary = await this.diaryModel.findOne({
      $and: [{ _id: id }],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${id} not found`);
    }
    await diary.remove();
    return id;
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

  async getDiaryShareWithMeV1(params: SearchDiaryDtoWithUser) {
    return this.diaryShareService.getSharePaginate(this.buildParams(params));
  }

  async getDiaryShareWithMe(params: SearchDiaryDtoWithUser) {
    const { page, pageSize, q, user } = this.buildParams(params);
    const listRecords = await this.diaryShareService.getSharedRecordByReceiverId(
      user,
    );
    let inCondition = {
      _id: { $in: listRecords },
    };

    const whereQuery = {
      $and: [
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
    const result = await (this.diaryModel as any).paginate(whereQuery, {
      page,
      limit: pageSize,
      populate: [{ path: 'tags' }, { path: 'user', select: '-password' }],
      sort: '-createdAt',
    });
    return result;
  }

  async shareDiary(triggleSendEmailDto: TriggerShareDiaryDto, user: any) {
    const diary = await this.diaryModel
      .findOne({
        $and: [{ _id: triggleSendEmailDto.id }, { user: user.id }],
      })
      .populate('user');
    if (!diary) {
      throw new BadRequestException(
        `Diary with id ${triggleSendEmailDto.id} not found`,
      );
    }
    const shares: any[] = [];
    const users = await this.userService.find({
      email: { $in: triggleSendEmailDto.emails },
    });
    const remainEmails = triggleSendEmailDto.emails.filter(
      el => !users.map(u => u.email).includes(el),
    );
    if (!!remainEmails.length && diary.status === Status.private) {
      await this.diaryModel.findOneAndUpdate(
        { _id: diary.id },
        {
          status: Status.public,
        } as any,
        {
          strict: false,
        },
      );
    }
    users.forEach(el => {
      shares.push({
        sender: user.id,
        receiver: el.id,
        receiverEmail: el.email,
        time: new Date(),
        record: triggleSendEmailDto.id,
      });
    });
    remainEmails.forEach(el => {
      shares.push({
        sender: user.id,
        receiver: null,
        receiverEmail: el,
        time: new Date(),
        record: triggleSendEmailDto.id,
      });
    });
    await this.diaryShareService.bulkCreate(shares);
    this.taskService.sendEmailShareDiary(
      diary as any,
      triggleSendEmailDto.emails.filter(el => el !== user.email),
    );
  }

  async shareDiaryNew(id: string, shares: ShareDiariesDto, user: any) {
    const records = await this.diaryModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
          user: mongoose.Types.ObjectId(user.id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'shares',
          localField: '_id',
          foreignField: 'record',
          as: 'shares',
        },
      },
      {
        $project: {
          'user.password': 0,
        },
      },
    ]);
    if (!records?.length) {
      throw new BadRequestException(`Diary with id ${id} not found`);
    }
    const diary = records[0];
    const users = await this.userService.find({
      email: { $in: shares.emails.map(el => el.email) },
    });
    const remainEmails = shares.emails.filter(
      el => !users.map(u => u.email).includes(el.email),
    );
    if (!!remainEmails.length && diary.status === Status.private) {
      await this.diaryModel.findOneAndUpdate(
        { _id: diary.id },
        {
          status: Status.public,
        } as any,
        {
          strict: false,
        },
      );
    }
    const emailsSendNoti = [];
    await Promise.all(
      users.map(el => {
        const shareItem = diary.shares.find(s => s.receiverEmail === el.email);
        const action = shares.emails.find(em => em.email === el.email)?.action;
        emailsSendNoti.push(el.email);
        if (shareItem) {
          return this.diaryShareService.findOneAndUpdate(
            { _id: shareItem._id },
            {
              sender: user.id,
              receiver: el.id,
              receiverEmail: el.email,
              record: id,
              action: action || 'view',
            },
          );
        } else {
          return this.diaryShareService.create({
            sender: user.id,
            receiver: el.id,
            receiverEmail: el.email,
            time: new Date(),
            record: id,
          });
        }
      }),
    );
    const emailsSendDirectly = [];
    await Promise.all(
      remainEmails.map(el => {
        emailsSendDirectly.push(el.email);
        const shareItem = diary.shares.find(s => s.receiverEmail === el.email);
        if (shareItem) {
          return this.diaryShareService.findOneAndUpdate(
            { _id: shareItem._id },
            {
              sender: user.id,
              receiver: null,
              receiverEmail: el.email,
              record: id,
              action: el.action || 'view',
            },
          );
        } else {
          return this.diaryShareService.create({
            sender: user.id,
            receiver: null,
            receiverEmail: el.email,
            time: new Date(),
            record: id,
            action: el.action || 'view',
          }) as any;
        }
      }),
    );
    const diarySend = await this.diaryModel
      .findOne({
        $and: [{ _id: id }, { user: user.id }],
      })
      .populate('user');
    emailsSendDirectly.length &&
      this.taskService.sendEmailDirectly(diarySend, emailsSendDirectly);
    emailsSendNoti.length &&
      this.taskService.sendNotifications(diarySend, emailsSendNoti);
  }

  async getAllDiaryOfUser(userId: string) {
    return await this.diaryModel.find({ user: userId }).exec();
  }

  async getListSharesById(diaryId: string, _user: any) {
    const diary = await this.diaryModel.findOne({
      $and: [{ _id: diaryId }, { user: _user.id }],
    });
    if (!diary) {
      throw new NotFoundException(`Diary with id ${diaryId} not found`);
    }
    return await this.diaryShareService.getSharedUserByDiaryId(_user, diaryId);
  }
}

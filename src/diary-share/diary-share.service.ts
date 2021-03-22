import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DiaryService } from 'src/diary/diary.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Share as DiaryShareMongo, ShareDocument } from './diary-share.scheme';

@Injectable()
export class DiaryShareService {
  constructor(
    @Inject(forwardRef(() => DiaryService))
    private readonly diaryService: DiaryService,
    @InjectModel(DiaryShareMongo.name)
    private shareModel: Model<ShareDocument>,
  ) {}

  async bulkCreate(items: any[]) {
    return await this.shareModel.insertMany(items);
  }

  async create(...args) {
    return await this.shareModel.create(...args);
  }

  async findOneAndUpdate(...args) {
    return await this.shareModel.findOneAndUpdate(...args);
  }

  async getSharedUser(user: any) {
    const listReceiver = await this.shareModel
      .find(
        { sender: user.id },
        {
          sender: 1,
          receiverEmail: 1,
          receiver: 1,
          record: 1,
        },
      )
      .populate('receiver')
      .exec();
    let emails = [];
    let result = [];
    listReceiver.forEach(el => {
      if (!emails.includes(el.receiverEmail)) {
        emails.push(el.receiverEmail);
        result.push({
          email: el.receiverEmail,
          username: el.receiver ? (el.receiver as any).username : null,
          name: el.receiver ? (el.receiver as any).name : null,
          picture: el.receiver ? (el.receiver as any).picture : null,
        });
      }
    });
    return result;
  }

  async getSharedUserByDiaryId(user: any, diaryId?: string) {
    const listReceiver = await this.shareModel
      .find({ record: diaryId, sender: user.id })
      .populate('receiver', 'username name picture email')
      .exec();
    let emails = [];
    let result = [];
    listReceiver.forEach(el => {
      if (!emails.includes(el.receiverEmail)) {
        emails.push(el.receiverEmail);
        result.push(el);
      }
    });
    return result;
  }

  async getSharedRecordByReceiverId(receiverId: string) {
    const listShares = await this.shareModel
      .find({ receiver: receiverId })
      .exec();
    return listShares.map(el => el.record);
  }

  async getSharesByReceiverId(receiverId: string) {
    const listShares = await this.shareModel
      .find({ receiver: receiverId })
      .exec();
    return listShares;
  }

  async getSharePaginate(params: any) {
    const { page, pageSize, q, user } = params;
    // const listRecords = await this.getSharedRecordByReceiverId(user);
    // let inCondition = {
    //   _id: { $in: listRecords },
    // };

    const whereQuery = {
      $and: [
        // { ...inCondition },
        // {
        //   $or: [
        //     {
        //       title: { $regex: `.*${q || ''}.*`, $options: 'i' },
        //     },
        //     {
        //       content: { $regex: `.*${q || ''}.*`, $options: 'i' },
        //     },
        //   ],
        // },
        { receiver: user.id },
      ],
    };
    const result = await (this.shareModel as any).paginate(whereQuery, {
      page,
      limit: pageSize,
      populate: [
        {
          path: 'record',
          populate: [{ path: 'tags' }, { path: 'user', select: '-password' }],
        },
      ],
      sort: '-updatedAt',
    });
    return result;
  }

  async find(condition: any) {
    return this.shareModel.find(condition);
  }
}

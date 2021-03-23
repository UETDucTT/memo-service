import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DiaryService } from 'src/diary/diary.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Share as DiaryShareMongo, ShareDocument } from './diary-share.scheme';
import mongoose from 'mongoose';

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
    const aggregate = this.shareModel.aggregate([
      {
        $lookup: {
          from: 'records',
          localField: 'record',
          foreignField: '_id',
          as: 'record',
        },
      },
      {
        $unwind: '$record',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      {
        $unwind: '$sender',
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'record.tags',
          foreignField: '_id',
          as: 'record.tags',
        },
      },
      {
        $match: {
          receiver: mongoose.Types.ObjectId(user.id),
          'record._id': { $ne: null },
          $or: [
            { 'record.title': { $regex: `.*${q || ''}.*`, $options: 'i' } },
            { 'record.content': { $regex: `.*${q || ''}.*`, $options: 'i' } },
          ],
        },
      },
      {
        $group: {
          _id: '$record._id',
          action: { $first: '$action' },
          sender: { $first: '$sender' },
          time: { $first: '$time' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          record: { $first: '$record' },
        },
      },
      {
        $project: {
          'sender.password': 0,
        },
      },
      {
        $addFields: {
          'sender.id': '$sender._id',
          'record.id': '$record._id',
          'record.links': {
            $map: {
              input: '$record.links',
              as: 'link',
              in: {
                $mergeObjects: ['$$link', { id: '$$link._id' }],
              },
            },
          },
          'record.resources': {
            $map: {
              input: '$record.resources',
              as: 'resource',
              in: {
                $mergeObjects: ['$$resource', { id: '$$resource._id' }],
              },
            },
          },
          'record.tags': {
            $map: {
              input: '$record.tags',
              as: 'tag',
              in: {
                $mergeObjects: ['$$tag', { id: '$$tag._id' }],
              },
            },
          },
        },
      },
    ]);
    const result = await (this.shareModel as any).aggregatePaginate(aggregate, {
      page,
      limit: pageSize,
      sort: '-updatedAt',
    });
    return result;
  }

  async find(condition: any) {
    return this.shareModel.find(condition);
  }
}

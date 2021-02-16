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

  async getSharedUser(user: any): Promise<string[]> {
    const allDiaries = await this.diaryService.getAllDiaryOfUser(user.id);
    const shares = await this.shareModel
      .find({
        diary: { $in: allDiaries.map(el => el.id) },
      })
      .exec();
    return Array.from(new Set(shares.map(el => el.email)));
  }
}

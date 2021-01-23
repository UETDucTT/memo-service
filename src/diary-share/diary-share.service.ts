import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/auth.entity';
import { DiaryService } from 'src/diary/diary.service';
import { In, Repository } from 'typeorm';
import { DiaryShare } from './diary-share.entity';

@Injectable()
export class DiaryShareService {
  constructor(
    @InjectRepository(DiaryShare)
    private readonly diaryShareRepo: Repository<DiaryShare>,
    @Inject(forwardRef(() => DiaryService))
    private readonly diaryService: DiaryService,
  ) {}

  bulkCreate(items: any[]) {
    return this.diaryShareRepo.save(items);
  }

  async getSharedUser(user: User): Promise<string[]> {
    const allDiaries = await this.diaryService.getAllDiaryOfUser(user.id);
    const shares = await this.diaryShareRepo.find({
      where: { diary: { id: In(allDiaries.map(el => el.id)) } },
    });
    return Array.from(new Set(shares.map(el => el.email)));
  }
}

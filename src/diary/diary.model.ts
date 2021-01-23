import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Diary } from './diary.entity';
import { DiaryResource } from 'src/resource/resource.entity';
import { PaginationResponse } from 'src/types';
import { User } from 'src/auth/auth.entity';
import { DiaryShare } from 'src/diary-share/diary-share.entity';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class OnlyId {
  @ApiProperty({ type: 'string' })
  @Expose()
  id: string | number;
}

type Resource = Omit<DiaryResource, 'createdAt' | 'updatedAt'>;

type DiaryItem = Omit<Diary, 'resource'> & {
  resources: Resource[];
};

export class DiariesResponse {
  diaries: DiaryItem[];
  pagination: PaginationResponse;
}

export class DiaryResponse {
  @ApiProperty()
  @Expose()
  diary: DiaryItem;
}

export class HistoryShareResponse {
  @ApiProperty()
  @Expose()
  shares: DiaryShare[];
}

export class SummaryDiariesResponse {
  @ApiProperty({ type: 'number' })
  @Expose()
  total: number;

  @ApiProperty({ type: 'number' })
  @Expose()
  current: number;

  @ApiProperty({ type: 'number' })
  @Expose()
  today: number;
}

export class UserOverview {
  id: number;
  email: string;
  name: string;
}

export class UserOverviewResponse {
  @ApiProperty({ type: () => [User] })
  @Expose()
  users: User[];
}

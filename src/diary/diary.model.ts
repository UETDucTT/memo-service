import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Diary } from './diary.schema';
import { PaginationResponse } from 'src/types';
import { User } from '../auth/auth.schema';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class OnlyId {
  @ApiProperty({ type: 'string' })
  @Expose()
  id: string | number;
}

export class DiariesResponse {
  diaries: Diary[];
  pagination: PaginationResponse;
}

export class DiaryResponse {
  @ApiProperty()
  @Expose()
  diary: Diary;
}

export class HistoryShareResponse {
  @ApiProperty()
  @Expose()
  shares: any[];
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

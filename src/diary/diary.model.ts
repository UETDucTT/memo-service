import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Diary } from './diary.entity';
import { DiaryResource } from 'src/resource/resource.entity';
import { PaginationResponse } from 'src/types';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  class Response {
    @ApiProperty({ description: 'Result', type: ResourceCls })
    result: T;

    @ApiProperty({ description: 'Status code' })
    statusCode?: number;

    @ApiProperty()
    error?: string;
  }
  return Response;
}

export class OnlyId {
  @ApiProperty()
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
  diary: DiaryItem;
}

export class SummaryDiariesResponse {
  total: number;
  today: number;
}

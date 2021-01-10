import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TagDto } from './tag.dto';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class OnlyId {
  @ApiProperty()
  @Expose()
  id: string | number;
}

export class TagsResponse {
  tags: TagDto[];
}

export class TagResponse {
  tag: TagDto;
}

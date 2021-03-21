import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CategoryDto } from './category.dto';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class OnlyId {
  @ApiProperty()
  @Expose()
  id: string | number;
}

export class OnlyIds {
  @ApiProperty()
  @Expose()
  ids: string[] | number[];
}

export class TagsResponse {
  categories: CategoryDto[];
}

export class CategoryResponse {
  category: CategoryDto;
}

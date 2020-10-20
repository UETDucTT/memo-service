import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  id: string;
}

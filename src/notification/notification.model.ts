import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from './notification.entity';
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

export class NotificationsResponse {
  notifications: Notification[];
  totalHNotSeen?: number;
  pagination: PaginationResponse;
}
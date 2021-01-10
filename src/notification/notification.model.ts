import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from './notification.entity';
import { DiaryResource } from 'src/resource/resource.entity';
import { PaginationResponse } from 'src/types';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class NotificationsResponse {
  notifications: Notification[];
  totalHNotSeen?: number;
  pagination: PaginationResponse;
}

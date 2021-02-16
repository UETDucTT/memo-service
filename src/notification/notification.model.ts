import { PaginationResponse } from 'src/types';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class NotificationsResponse {
  notifications: any[];
  totalHNotSeen?: number;
  pagination: PaginationResponse;
}

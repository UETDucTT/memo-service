import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

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

export class IDToken {
  @ApiProperty({ description: 'ID Token from google' })
  @IsDefined()
  @IsString()
  idToken: string;
}

export class SystemToken {
  @ApiProperty()
  @Expose()
  token: string;
}

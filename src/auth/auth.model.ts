import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export type ClassType<T = any> = new (...args: any[]) => T;

export function TransformResponse<T extends ClassType>(ResourceCls: T): any {
  return ResourceCls;
}

export class IDToken {
  @ApiProperty({ description: 'ID Token from google' })
  @IsDefined()
  @IsString()
  idToken: string;
}

export class TokenRequest {
  @ApiProperty({ description: 'Token verify' })
  @IsDefined()
  @IsString()
  token: string;
}

export class SystemToken {
  @ApiProperty()
  @Expose()
  token: string;
}

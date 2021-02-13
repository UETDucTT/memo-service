import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsUUID } from 'class-validator';

export class SearchNotificationDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(({ value: val }) => {
    if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
      throw new BadRequestException('pageSize validation fail');
    }
    return parseInt(val?.toString());
  })
  pageSize: number;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  lastId: string;
}

export class ParamNotiDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}

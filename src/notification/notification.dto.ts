import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class SearchNotificationDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  // @Transform(val => {
  //   if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
  //     throw new BadRequestException('page validation fail');
  //   }
  //   return parseInt(val?.toString());
  // })
  page: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  // @Transform(val => {
  //   if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
  //     throw new BadRequestException('pageSize validation fail');
  //   }
  //   return parseInt(val?.toString());
  // })
  pageSize: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  lastId: string;
}

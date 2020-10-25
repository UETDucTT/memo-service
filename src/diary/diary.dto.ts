import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  IsDate,
} from 'class-validator';
import { Type } from 'src/resource/resource.entity';
import { Emotion } from './diary.entity';

export class ResourceDto {
  @ApiProperty({ enum: Type })
  @IsDefined()
  @IsEnum(Type)
  type: Type;

  @ApiProperty()
  @IsDefined()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  note: string;
}

export class CreateDiaryDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  content?: string;

  @ApiProperty({ required: false, enum: Emotion })
  @IsEnum(Emotion)
  emotion?: Emotion;

  @ApiProperty({ required: false })
  @IsString()
  @MaxLength(255)
  tag?: string;

  @ApiProperty({ required: false, type: () => [ResourceDto] })
  @IsArray()
  resources?: ResourceDto[];
}

export class SearchDiaryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(val => {
    if (isNaN(parseInt(val))) {
      throw new BadRequestException('page validation fail');
    }
    return parseInt(val);
  })
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(val => {
    if (isNaN(parseInt(val))) {
      throw new BadRequestException('page validation fail');
    }
    return parseInt(val);
  })
  pageSize: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @ApiProperty({ required: false, default: new Date().toISOString() })
  @IsDateString()
  @IsOptional()
  toDate: Date;
}

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
  IsUUID,
  IsEmail,
  isUUID,
} from 'class-validator';
import { Type } from 'src/resource/resource.entity';
import { Emotion, Status } from './diary.entity';

export class ResourceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: Type })
  @IsDefined()
  @IsEnum(Type)
  type: Type;

  @ApiProperty()
  @IsDefined()
  @IsString()
  url: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiProperty({ enum: Status, default: Status.private })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ required: false })
  @IsUUID()
  tagId: string;

  @ApiProperty({ required: false, type: () => [ResourceDto] })
  @IsArray()
  resources?: ResourceDto[];
}

export class EditDiaryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, enum: Emotion })
  @IsOptional()
  @IsEnum(Emotion)
  emotion?: Emotion;

  @ApiProperty({ enum: Status, default: Status.private })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  @MaxLength(255)
  tagId: string;

  @ApiProperty({ required: false, type: () => [ResourceDto] })
  @IsOptional()
  @IsArray()
  resources?: ResourceDto[];
}

export class SearchDiaryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Emotion, { each: true })
  @Transform(val => {
    if (val) {
      if (!Array.isArray(val)) {
        return [val];
      }
    }
    return val;
  })
  emotion: string[];

  @ApiProperty({ required: false })
  @IsString({ each: true })
  @IsOptional()
  @Transform(val => {
    if (val) {
      if (!Array.isArray(val)) {
        return [val];
      }
    }
    return val;
  })
  tag: string[];

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(val => {
    if (isNaN(parseInt(val)) || parseInt(val) <= 0) {
      throw new BadRequestException('page validation fail');
    }
    return parseInt(val);
  })
  page: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(val => {
    if (isNaN(parseInt(val)) || parseInt(val) <= 0) {
      throw new BadRequestException('pageSize validation fail');
    }
    return parseInt(val);
  })
  pageSize: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @ApiProperty({ required: false, default: new Date().toISOString() })
  @IsDateString()
  @IsOptional()
  toDate: Date;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  lastId: string;
}

export class ParamDiaryDto {
  @ApiProperty({ required: false, default: 'id' })
  @IsUUID()
  id: string;
}

export class TriggerSandEmailDto {
  @ApiProperty()
  @IsDefined()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail({}, { each: true })
  emails: string[];
}

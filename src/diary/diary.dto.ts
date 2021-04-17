import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type as CTType, Expose } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'src/resource/resource.entity';
import { Status } from './diary.entity';

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
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  size?: number;
}

export class LinkDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  url: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;
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

  @ApiProperty({ enum: Status, default: Status.private })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  tagIds: string[];

  @ApiProperty({ required: false, type: () => [ResourceDto] })
  @IsArray()
  resources?: ResourceDto[];

  @ApiProperty({ required: false, type: () => [LinkDto] })
  @IsArray()
  links?: LinkDto[];

  @ApiProperty()
  @IsDateString()
  time: Date;
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiProperty({ enum: Status, default: Status.private })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({ each: true })
  tagIds: string;

  @ApiProperty({ required: false, type: () => [ResourceDto] })
  @IsOptional()
  @IsArray()
  resources?: ResourceDto[];

  @ApiProperty({ required: false, type: () => [LinkDto] })
  @IsOptional()
  @IsArray()
  links?: LinkDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  time: Date;
}

export class SearchDiaryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  q: string;

  @IsOptional()
  @ApiProperty({
    type: [String],
    format: 'form',
    required: false,
  })
  @IsArray()
  @Transform(({ value }) => value.split(','))
  @IsMongoId({ each: true })
  tag: string[];

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value: val }) => {
    if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
      throw new BadRequestException('page validation fail');
    }
    return parseInt(val?.toString());
  })
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value: val }) => {
    if (val !== 'true' && val !== 'false') {
      throw new BadRequestException('pinned validation fail');
    }
    return val === 'true';
  })
  pinned: boolean;

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
  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @ApiProperty({ required: false, default: new Date().toISOString() })
  @IsDateString()
  @IsOptional()
  toDate: Date;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  lastId: string;
}

export class ParamDiaryDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}

export class TriggerShareDiaryDto {
  @ApiProperty()
  @IsDefined()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsEmail({}, { each: true })
  emails: string[];
}

export enum ACTION {
  VIEW = 'view',
  EDIT = 'edit',
}

export class ShareDiaryDto {
  @ApiProperty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  @IsEnum(ACTION)
  action: ACTION;
}

export class ShareDiariesDto {
  @ApiProperty({ required: false, type: [ShareDiaryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @CTType(() => ShareDiaryDto)
  emails: ShareDiaryDto[];
}

export class RecordTimeDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Expose()
  time: number;
}

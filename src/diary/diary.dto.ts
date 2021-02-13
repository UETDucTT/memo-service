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
  IsDate,
  IsMongoId,
} from 'class-validator';
import { Type } from 'src/resource/resource.entity';
import { Emotion, Status } from './diary.entity';

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
  })
  @IsArray()
  @Transform(({ value }) => value.split(','))
  @IsMongoId({ each: true })
  tag: string[];

  // @ApiProperty({ required: false, default: 1 })
  // @IsOptional()
  // @Transform(({ value: val }) => {
  //   if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
  //     throw new BadRequestException('page validation fail');
  //   }
  //   return parseInt(val?.toString());
  // })
  // page: number;

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
  @ApiProperty({ required: false, default: 'id' })
  @IsMongoId()
  id: string;
}

export class TriggerSandEmailDto {
  @ApiProperty()
  @IsDefined()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsEmail({}, { each: true })
  emails: string[];
}

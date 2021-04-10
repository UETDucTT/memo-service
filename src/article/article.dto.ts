import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class ArticleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  web?: string;

  @ApiProperty()
  website?: string;

  @ApiProperty()
  publishDate?: string;
}

export class CreateArticleDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  web: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  publishDate: string;

  @ApiProperty()
  category: string;
}

export class SearchArticleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value: val }) => {
    if (isNaN(parseInt(val?.toString())) || parseInt(val?.toString()) <= 0) {
      throw new BadRequestException('page validation fail');
    }
    return parseInt(val?.toString());
  })
  page: number;

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
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @ApiProperty({
    type: [String],
    format: 'form',
  })
  @IsArray()
  @Transform(({ value }) => value.split(','))
  @IsMongoId({ each: true })
  categoryIds?: string[];
}

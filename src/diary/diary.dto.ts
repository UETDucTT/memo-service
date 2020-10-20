import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsInt,
  IsString,
  Min,
  MaxLength,
  IsEnum,
  IsArray,
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

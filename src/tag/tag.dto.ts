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
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class TagDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  color: string;
}

export class ParamTagDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}

export class EditTagDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  color: string;

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;
}

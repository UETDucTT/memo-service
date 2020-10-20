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

export class ResourceDto {
  diaryId: string;

  @ApiProperty({ enum: Type })
  @IsDefined()
  @IsEnum(Type)
  type: Type;

  @ApiProperty()
  @IsDefined()
  @IsString()
  url: string;
}

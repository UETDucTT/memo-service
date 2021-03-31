import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  IsArray,
  IsOptional,
  IsBoolean,
  IsMongoId,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  type?: string;
}

export class ParamCategoryDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}

export class EditCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateCategoryDtoSingle {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateCategoryDtoSingle)
  categories: CreateCategoryDtoSingle[];
}

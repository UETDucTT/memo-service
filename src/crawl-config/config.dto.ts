import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsJSON, IsDateString } from 'class-validator';

export class ConfigDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  config: string;
}

export class ParamConfigDto {
  @ApiProperty({ required: false, default: 'id' })
  @IsMongoId()
  id: string;
}

export class EditConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsJSON()
  config?: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  categoryId: string;
}

export class CreateConfigDto {
  @ApiProperty()
  @IsJSON()
  config: string;

  @ApiProperty()
  @IsMongoId()
  categoryId: string;
}

export class TestCrawlDto {
  @ApiProperty()
  config: any;
}

export class RunCrawlDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate: Date;
}

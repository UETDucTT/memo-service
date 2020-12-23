import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  IsUrl,
} from 'class-validator';
import { PreviewLinkService } from './link-preview.service';

class RequestGetPreviewLink {
  @ApiProperty()
  @IsUrl()
  url: string;
}

@Controller('preview-link')
@ApiTags('Preview Link')
export class PreviewLinkController {
  constructor(private previewLinkService: PreviewLinkService) {}

  @Get([''])
  @ApiResponse({
    status: 200,
    description: 'Get link preview',
  })
  async getPreviewLink(@Query() dto: RequestGetPreviewLink): Promise<any> {
    const res = await this.previewLinkService.getLinkPreview(dto.url);
    return res;
  }
}

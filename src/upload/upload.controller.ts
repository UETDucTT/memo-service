import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@Controller('upload')
@ApiTags('Upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post(['/aws'])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resource: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Upload file',
  })
  async uploadFile(@Req() request, @Res() response): Promise<any> {
    await this.uploadService.upload(request, response);
  }
}

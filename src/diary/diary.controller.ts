import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateDiaryDto, SearchDiaryDto } from './diary.dto';
import { AuthMeta } from 'src/auth/auth.decorator';
import { DiariesResponse, OnlyId, TransformResponse } from './diary.model';
import { DiaryService } from './diary.service';

@Controller('diaries')
@ApiTags('Diary Action')
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Get([''])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list diaries',
    type: TransformResponse(DiariesResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiaries(
    @AuthMeta() user,
    @Query() dto: SearchDiaryDto,
  ): Promise<DiariesResponse> {
    const [list, cnt] = await this.diaryService.getList({ ...dto, user });
    return {
      diaries: list,
      pagination: {
        totalItems: cnt,
        page: dto.page,
        pageSize: dto.pageSize,
      },
    };
  }

  @Post([''])
  @ApiOperation({ summary: 'Create diary' })
  @ApiResponse({
    status: 200,
    description: 'created diary',
    type: TransformResponse(OnlyId),
  })
  @ApiBearerAuth('Authorization')
  async createDiaries(
    @AuthMeta() user,
    @Body() createDiaryDto: CreateDiaryDto,
  ): Promise<OnlyId> {
    const newDiary = await this.diaryService.create({
      ...createDiaryDto,
      user,
    });
    return {
      id: newDiary.id,
    };
  }
}

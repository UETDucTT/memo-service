import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateDiaryDto, SearchDiaryDto, ParamDiaryDto } from './diary.dto';
import { AuthMeta } from 'src/auth/auth.decorator';
import {
  DiariesResponse,
  DiaryResponse,
  OnlyId,
  TransformResponse,
} from './diary.model';
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
    const { result, hasMore } = await this.diaryService.getList({
      ...dto,
      user,
    });
    const [list, cnt] = result;
    return {
      diaries: list,
      pagination: {
        totalItems: cnt,
        hasMore,
      },
    };
  }

  @Get(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get one diary',
    type: TransformResponse(DiaryResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiary(@Param() params: ParamDiaryDto): Promise<DiaryResponse> {
    const res = await this.diaryService.getById(params.id);
    return {
      diary: res,
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

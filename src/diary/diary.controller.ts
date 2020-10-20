import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDiaryDto } from './diary.dto';
import { AuthMeta } from 'src/auth/auth.decorator';
import { OnlyId, TransformResponse } from './diary.model';
import { DiaryService } from './diary.service';

@Controller('diaries')
@ApiTags('Diary Action')
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  // @Get([''])
  // getDiaries(): string {
  //   return 'ok';
  // }

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

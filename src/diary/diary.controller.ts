import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateDiaryDto,
  SearchDiaryDto,
  ParamDiaryDto,
  EditDiaryDto,
  TriggerShareDiaryDto,
} from './diary.dto';
import { AuthMeta } from 'src/auth/auth.decorator';
import {
  DiariesResponse,
  DiaryResponse,
  OnlyId,
  TransformResponse,
  SummaryDiariesResponse,
  HistoryShareResponse,
} from './diary.model';
import { DiaryService } from './diary.service';
import { TransformInterceptor } from './transform.inteceptor';

@Controller('diaries')
@ApiTags('Diary Action')
@UseInterceptors(new TransformInterceptor())
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Get(['/summary'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get summary diaries',
    type: TransformResponse(SummaryDiariesResponse),
  })
  async getSummaryDiaries(
    @AuthMeta() user,
    @Query() dto: SearchDiaryDto,
    @Headers() headers: any,
  ): Promise<SummaryDiariesResponse> {
    const clientTimezoneOffset = parseInt(headers['x-timezone-offset']) || 0;
    const x = new Date();
    x.setHours(0, 0, 0, 0);
    const currTimezoneOffset = x.getTimezoneOffset();
    const startTimeToday = new Date(
      x.getTime() + (clientTimezoneOffset - currTimezoneOffset) * 60 * 1000,
    );
    const res = await this.diaryService.getSummaryDiaries(
      user.id,
      dto,
      startTimeToday,
    );
    return res;
  }

  @Get([''])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list diaries',
    type: TransformResponse(DiariesResponse),
  })
  async getDiaries(
    @AuthMeta() user,
    @Query() dto: SearchDiaryDto,
  ): Promise<any> {
    const {
      docs,
      hasNextPage: hasMore,
      totalDocs,
    } = await this.diaryService.getList({
      ...dto,
      user,
    });
    return {
      diaries: docs,
      pagination: {
        totalItems: totalDocs,
        hasMore,
      },
    };
  }

  @Get(['/share-with-me'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list diaries',
    type: TransformResponse(DiariesResponse),
  })
  async getDiariesShareWithMe(
    @AuthMeta() user,
    @Query() dto: SearchDiaryDto,
  ): Promise<any> {
    const {
      docs,
      hasNextPage: hasMore,
      totalDocs,
    } = await this.diaryService.getDiaryShareWithMe({
      ...dto,
      user,
    });
    return {
      diaries: docs,
      pagination: {
        totalItems: totalDocs,
        hasMore,
      },
    };
  }

  @Get(['/share-with-me/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get diariy share',
    type: TransformResponse(DiaryResponse),
  })
  async getDiaryShareWithMe(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
  ): Promise<any> {
    const res = await this.diaryService.getShareById(params.id, user.id);
    return {
      diary: res,
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
  async getDiary(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
  ): Promise<any> {
    const res = await this.diaryService.getById(params.id, user.id);
    return {
      diary: res,
    };
  }

  @Get(['/:id/shares'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list shared user one diary',
    type: TransformResponse(DiaryResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiaryShares(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
  ): Promise<any> {
    const res = await this.diaryService.getListSharesById(params.id, user);
    return {
      users: res,
    };
  }

  @Get(['/public/:id'])
  @ApiResponse({
    status: 200,
    description: 'get one diary public',
    type: TransformResponse(DiaryResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiaryPublic(@Param() params: ParamDiaryDto): Promise<any> {
    const res = await this.diaryService.getPublicById(params.id);
    return {
      diary: res,
    };
  }

  @Post(['/trigger-send-email'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'send email',
    type: TransformResponse(TriggerShareDiaryDto),
  })
  async triggerSendEmail(
    @Body() triggleShareDiaryDto: TriggerShareDiaryDto,
    @AuthMeta() user,
  ): Promise<any> {
    await this.diaryService.shareDiary(triggleShareDiaryDto, user);
    return {
      success: true,
    };
  }

  // @Get(['/:id/history-shares'])
  // @ApiBearerAuth('Authorization')
  // @ApiResponse({
  //   status: 200,
  //   description: 'get history shares',
  //   type: TransformResponse(HistoryShareResponse),
  // })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async getDiaryShares(
  //   @Param() params: ParamDiaryDto,
  //   @AuthMeta() user,
  // ): Promise<any> {
  //   const res = await this.diaryService.getById(params.id, user.id);
  //   return {
  //     shares: null,
  //   };
  // }

  @Patch(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'edit diary',
    type: TransformResponse(OnlyId),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async editDiary(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
    @Body() editDiaryDto: EditDiaryDto,
  ): Promise<OnlyId> {
    const updatedDiary = await this.diaryService.update(
      params.id,
      user.id,
      editDiaryDto,
    );
    return {
      id: updatedDiary,
    };
  }

  @Delete(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'delete one diary',
    type: TransformResponse(OnlyId),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteDiary(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
  ): Promise<OnlyId> {
    const deletedDiary = await this.diaryService.deleteById(params.id, user.id);
    return {
      id: deletedDiary,
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
      user: user.id,
    });
    return {
      id: newDiary.id,
    };
  }
}

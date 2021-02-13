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
  TriggerSandEmailDto,
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
  ): Promise<SummaryDiariesResponse> {
    const res = await this.diaryService.getSummaryDiaries(user.id, dto);
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
    type: TransformResponse(TriggerSandEmailDto),
  })
  async triggerSendEmail(
    @Body() triggleSendEmailDto: TriggerSandEmailDto,
    @AuthMeta() user,
  ): Promise<any> {
    await this.diaryService.shareDiary(triggleSendEmailDto, user);
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

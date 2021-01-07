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
  BadRequestException,
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
} from './diary.model';
import { DiaryService } from './diary.service';
import { TaskService } from '../task/task.service';
import { Status } from './diary.entity';
import { Tag } from 'src/tag/tag.entity';

@Controller('diaries')
@ApiTags('Diary Action')
export class DiaryController {
  constructor(
    private diaryService: DiaryService,
    private taskService: TaskService,
  ) {}

  @Get(['/summary'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get summary diaries',
    type: TransformResponse(SummaryDiariesResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
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
  async getDiary(
    @Param() params: ParamDiaryDto,
    @AuthMeta() user,
  ): Promise<DiaryResponse> {
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
  async getDiaryPublic(@Param() params: ParamDiaryDto): Promise<DiaryResponse> {
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
    const diary = await this.diaryService.getById(
      triggleSendEmailDto.id,
      user.id,
    );
    if (diary.status !== Status.public) {
      throw new BadRequestException('Diary non-public');
    }
    this.taskService.sendEmailShareDiary(
      diary,
      triggleSendEmailDto.emails.filter(el => el !== user.email),
    );
    return {
      success: true,
    };
  }

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
      user,
    });
    return {
      id: newDiary.id,
    };
  }
}

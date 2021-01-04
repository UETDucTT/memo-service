import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ValidationPipe,
  UsePipes,
  Body,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthMeta } from 'src/auth/auth.decorator';
import {
  TransformResponse,
  TagsResponse,
  TagResponse,
  OnlyId,
} from './tag.model';
import { TagService } from './tag.service';
import { ParamTagDto, EditTagDto, CreateTagDto } from './tag.dto';

@Controller('tags')
@ApiTags('Tags Action')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get(['/get-all'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list tags',
    type: TransformResponse(TagsResponse),
  })
  async getAllTags(@AuthMeta() user): Promise<TagsResponse> {
    const result = await this.tagService.getAllTags(user);
    return {
      tags: result,
    };
  }

  @Get(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get one tag',
    type: TransformResponse(TagResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiary(
    @Param() params: ParamTagDto,
    @AuthMeta() user,
  ): Promise<TagResponse> {
    const res = await this.tagService.getById(params.id, user.id);
    return {
      tag: res,
    };
  }

  @Patch(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'edit tag',
    type: TransformResponse(OnlyId),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async editDiary(
    @Param() params: ParamTagDto,
    @AuthMeta() user,
    @Body() editTagDto: EditTagDto,
  ): Promise<OnlyId> {
    const updatedTag = await this.tagService.update(
      params.id,
      user.id,
      editTagDto,
    );
    return {
      id: updatedTag,
    };
  }

  @Delete(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'delete one tag',
    type: TransformResponse(OnlyId),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteDiary(
    @Param() params: ParamTagDto,
    @AuthMeta() user,
  ): Promise<OnlyId> {
    const deletedTag = await this.tagService.deleteById(params.id, user.id);
    return {
      id: deletedTag,
    };
  }

  @Post([''])
  @ApiResponse({
    status: 200,
    description: 'created diary',
    type: TransformResponse(OnlyId),
  })
  @ApiBearerAuth('Authorization')
  async createDiaries(
    @AuthMeta() user,
    @Body() createTagDto: CreateTagDto,
  ): Promise<OnlyId> {
    const newTag = await this.tagService.create({
      ...createTagDto,
      user,
    });
    return {
      id: newTag.id,
    };
  }
}

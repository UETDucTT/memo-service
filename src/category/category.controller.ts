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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthMeta } from 'src/auth/auth.decorator';
import { CategoryService } from './category.service';
import { TransformInterceptor } from './transform.inteceptor';
import {
  CreateCategoryDto,
  ParamCategoryDto,
  EditCategoryDto,
} from './category.dto';

@Controller('categories')
@ApiTags('Category Action')
@UseInterceptors(new TransformInterceptor())
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get(['/get-all'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list category',
  })
  async getAllCategory(@AuthMeta() user): Promise<any> {
    const categories = await this.categoryService.getAllCategories();
    return {
      categories,
    };
  }

  @Patch(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'edit category',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async editCategory(
    @Param() params: ParamCategoryDto,
    @AuthMeta() _user,
    @Body() editCategoryDto: EditCategoryDto,
  ): Promise<any> {
    const updatedCategory = await this.categoryService.update(
      params.id,
      editCategoryDto,
    );
    return {
      id: updatedCategory,
    };
  }

  @Delete(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'delete one category',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteDiary(
    @Param() params: ParamCategoryDto,
    @AuthMeta() _user,
  ): Promise<any> {
    const deletedCategory = await this.categoryService.deleteById(params.id);
    return {
      id: deletedCategory,
    };
  }

  @Post([''])
  @ApiResponse({
    status: 200,
    description: 'created categories',
  })
  @ApiBearerAuth('Authorization')
  async createCategories(
    @AuthMeta() user,
    @Body() createCategoriesDto: CreateCategoryDto,
  ): Promise<any> {
    const categories = await this.categoryService.bulkCreate(
      createCategoriesDto.categories,
    );
    return {
      ids: categories.map(el => el.id),
    };
  }
}

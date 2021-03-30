import { Controller, Get, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthMeta } from 'src/auth/auth.decorator';
import { ArticleService } from './article.service';
import { TransformInterceptor } from './transform.inteceptor';
import { SearchArticleDto } from './article.dto';

@Controller('articles')
@ApiTags('Article Action')
@UseInterceptors(new TransformInterceptor())
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get([''])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list article',
  })
  async getArticles(
    @AuthMeta() user,
    @Query() dto: SearchArticleDto,
  ): Promise<any> {
    const {
      docs,
      hasNextPage: hasMore,
      totalDocs,
    } = await this.articleService.getList(dto);
    return {
      articles: docs,
      pagination: {
        totalItems: totalDocs,
        hasMore,
      },
    };
  }
}

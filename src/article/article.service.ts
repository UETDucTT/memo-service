import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from './article.schema';
import { SearchArticleDto } from './article.dto';
import { addDays, maxTime } from 'date-fns';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: Model<ArticleDocument>,
  ) {}

  buildParams(params: SearchArticleDto) {
    let { page, pageSize, fromDate, toDate, ...rest } = params;
    if (!page) {
      page = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }
    return {
      ...rest,
      page,
      pageSize,
      fromDate,
      toDate,
    };
  }

  async getList(params: SearchArticleDto) {
    const { page, pageSize, fromDate, toDate, categoryId } = this.buildParams(
      params,
    );
    let betweenCondition = {};

    if (fromDate && toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };
    } else if (fromDate) {
      betweenCondition = {
        time: {
          $gte: new Date(fromDate),
          $lte: new Date(maxTime),
        },
      };
    } else if (toDate) {
      betweenCondition = {
        time: {
          $gte: new Date(0),
          $lte: new Date(toDate),
        },
      };
    }

    const whereQuery = {
      $and: [
        { ...betweenCondition },
        { ...(categoryId ? { category: categoryId } : {}) },
      ],
    };
    const result = await (this.articleModel as any).paginate(whereQuery, {
      page,
      limit: pageSize,
      populate: 'category',
      sort: '-createdAt',
    });
    return result;
  }
}

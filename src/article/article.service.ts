import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from './article.schema';
import { SearchArticleDto, CreateArticleDto } from './article.dto';
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
    const {
      page,
      pageSize,
      fromDate,
      toDate,
      categoryId,
      categoryIds,
    } = this.buildParams(params);
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

    let inCondition = {};

    if (categoryId || categoryIds?.length) {
      let arrayCat = null;
      if (categoryId) arrayCat = [categoryId];
      if (categoryIds?.length) arrayCat = categoryIds;
      inCondition = {
        category: { $in: arrayCat },
      };
    }

    const whereQuery = {
      $and: [{ ...betweenCondition }, { ...inCondition }],
    };
    const result = await (this.articleModel as any).paginate(whereQuery, {
      page,
      limit: pageSize,
      populate: 'category',
      sort: '-publishDate',
    });
    return result;
  }

  async createIfUrlNotExist(params: CreateArticleDto) {
    const articleExist = await this.articleModel.findOne({ url: params.url });
    if (!articleExist) {
      const newArticleObj = new this.articleModel(params);
      return await newArticleObj.save();
    }
  }
}

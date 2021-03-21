import {
  forwardRef,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Config, ConfigDocument } from './config.schema';
import { CreateConfigDto, EditConfigDto, RunCrawlDto } from './config.dto';
import { CategoryService } from 'src/category/category.service';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Bluebird from 'bluebird';
import parseDate from 'date-fns/parse';

fetch.Promise = Bluebird;

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name)
    private configModel: Model<ConfigDocument>,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
  ) {}

  getAllConfigs() {
    return this.configModel
      .find()
      .populate('category')
      .sort('-createdAt');
  }

  async create(params: CreateConfigDto) {
    const category = await this.categoryService.find({
      _id: params.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Category with id ${params.categoryId} not found`,
      );
    }
    const newConfigObj = new this.configModel({
      config: params.config,
      category: params.categoryId,
    });
    return await newConfigObj.save();
  }

  async update(id: string, params: EditConfigDto) {
    const config = await this.configModel.findById(id);
    if (!config) {
      throw new NotFoundException(`config with id ${id} not found`);
    }
    if (params.categoryId) {
      const category = await this.categoryService.find({
        _id: params.categoryId,
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${params.categoryId} not found`,
        );
      }
    }
    const newParams = {
      category: params.categoryId ? params.categoryId : config.category,
      config: params.config ? params.config : config.config,
    };
    const updatedConfig = await this.configModel
      .findByIdAndUpdate(id, newParams)
      .exec();
    return updatedConfig;
  }

  async deleteById(id: string) {
    const config = await this.configModel.findById(id);
    if (!config) {
      throw new NotFoundException(`config with id ${id} not found`);
    }
    await config.remove();
    return id;
  }

  async runCrawl(params: RunCrawlDto) {
    const data = await fetch('https://www.tienphong.vn/kinh-te/');
    const $ = cheerio.load(await data.text());
    const listArticles = $('.other-news .left-story').toArray();
    const articles = await Bluebird.map(
      listArticles,
      async ele => {
        const title = $('.story-heading', ele)
          .first()
          .text();
        const description = $('.summary', ele)
          .first()
          .text();
        const url = $('.story-link')
          .first()
          .attr('href');
        const article = await fetch(url);
        const child = cheerio.load(await article.text());
        const content = child('#article-body').html();
        const dateString = child('.byline-dateline time')
          .first()
          .text();
        const image = child('meta[property=og\\:image]').attr('content');
        const publishDate = parseDate(
          dateString,
          'dd/MM/yyyy HH:mm',
          new Date(),
        );
        return {
          title,
          description,
          url,
          content,
          publishDate,
          image,
          website: new URL('https://www.tienphong.vn/kinh-te/').origin,
          web: 'Tiền Phong',
        };
      },
      { concurrency: 30 },
    );

    return articles;
  }

  async runTestCrawl(config: any) {
    const data = await fetch(config.startUrl);
    const $ = cheerio.load(await data.text());
    const listArticles = $(config.listSelector).toArray();
    const articles = await Bluebird.map(
      listArticles,
      async ele => {
        const result: any = {};
        const outsideItems = config.items;
        Object.entries(outsideItems).forEach(([k, v]: any) => {
          if (v.type === 'text') {
            result[k] = $(v.selector, ele)
              .first()
              .text();
            if (v.isDate) {
              result[k] = parseDate(result[k], v.formatDate, new Date());
            }
          }
          if (v.type === 'attr') {
            result[k] = $(v.selector, ele)
              .first()
              .attr(v.attrName);
            if (v.isDate) {
              result[k] = parseDate(result[k], v.formatDate, new Date());
            }
          }
          if (v.type === 'html') {
            result[k] = $(v.selector, ele)
              .first()
              .html();
          }
        });
        let detailUrl = result[config.keyUrlDetail];

        if (detailUrl) {
          if (!detailUrl.includes('http')) {
            detailUrl = `${new URL(config.startUrl).origin}${detailUrl}`;
          }
          const article = await fetch(detailUrl);
          const child = cheerio.load(await article.text());
          const detailItems = config.detail.items;
          Object.entries(detailItems).forEach(([k, v]: any) => {
            if (v.type === 'text') {
              result[k] = child(v.selector)
                .first()
                .text();
              if (v.isDate) {
                result[k] = parseDate(result[k], v.formatDate, new Date());
              }
            }
            if (v.type === 'attr') {
              result[k] = child(v.selector)
                .first()
                .attr(v.attrName);
              if (v.isDate) {
                result[k] = parseDate(result[k], v.formatDate, new Date());
              }
            }
            if (v.type === 'html') {
              result[k] = child(v.selector)
                .first()
                .html();
            }
          });
        }
        if (result.url) {
          if (!result.url.includes('http')) {
            result.url = `${new URL(config.startUrl).origin}${result.url}`;
          }
        }
        return result;
      },
      { concurrency: 5 },
    );

    return articles;
  }
}

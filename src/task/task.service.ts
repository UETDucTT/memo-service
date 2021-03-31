import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { User as UserMongo } from 'src/auth/auth.schema';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { CategoryService } from 'src/category/category.service';
import { CrawlConfigService } from 'src/crawl-config/config.service';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Bluebird from 'bluebird';
import toDate from 'date-fns/toDate';
import { ArticleService } from 'src/article/article.service';

fetch.Promise = Bluebird;

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => AuthService))
    private readonly userService: AuthService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => CrawlConfigService))
    private readonly configService: CrawlConfigService,
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    private config: ConfigService,
  ) {}
  async sendEmailDirectly(diary: any, emails: string[]) {
    return this.mailerService
      .sendMail({
        to: emails,
        from: 'iMemo <admin@imemo.vn>', // Senders email address
        subject: `[iMemo] Thư mời xem memo của ${diary.user.name}`,
        context: {
          name: diary.user.name,
          link: `${this.config.get<string>('service.domainClient')}/share?ref=${
            diary.id
          }`,
        },
        template: 'shareDiary',
      })
      .then(async success => {
        console.log(success);
      })
      .catch(err => {
        console.error(err);
      });
  }

  async sendNotifications(diary: any, emails: string[]) {
    const users = await this.userService.find({
      email: { $in: emails },
    });
    if (users && users.length) {
      const notifications = users.map(el => {
        return {
          user: el.id,
          data: JSON.stringify({
            type: 'INVITE_VIEW_DIARY',
            diary,
          }),
        };
      });
      const results = await this.notificationService.bulkCreateNotification(
        notifications,
      );
      this.notificationGateway.sendToUser(results);
    }
  }

  async sendEmailShareDiary(diary: any, emails: string[]) {
    const users = await this.userService.find({
      email: { $in: emails },
    });
    if (users && users.length) {
      const notifications = users.map(el => {
        return {
          user: el.id,
          data: JSON.stringify({
            type: 'INVITE_VIEW_DIARY',
            diary,
          }),
        };
      });
      const results = await this.notificationService.bulkCreateNotification(
        notifications,
      );
      this.notificationGateway.sendToUser(results);
    }
    const emailSendByMailService = emails.filter(
      el => !users.map(item => item.email).includes(el),
    );
    if (emailSendByMailService.length) {
      this.mailerService
        .sendMail({
          to: emailSendByMailService,
          from: 'iMemo <admin@imemo.vn>', // Senders email address
          subject: `[Memo] Thư mời xem memo của ${diary.user.name}`,
          context: {
            name: diary.user.name,
            link: `${this.config.get<string>(
              'service.domainClient',
            )}share?ref=${diary.id}`,
          },
          template: 'shareDiary',
        })
        .then(async success => {
          console.log(success);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  async sendEmailVerifyAccount(
    userInfo: { username: string; email: string },
    token: string,
  ) {
    this.mailerService
      .sendMail({
        to: userInfo.email,
        from: 'DUCTT-UET <trantienduc10@gmail.com>', // Senders email address
        subject: `[MEMO] Bạn cần xác thực email trước khi đăng nhập 😱`,
        context: {
          name: userInfo.username,
          link: `${this.config.get<string>(
            'service.domainClient',
          )}/confirm-register?token=${token}`,
        },
        template: 'verifyAccount',
      })
      .then(async success => {
        console.log(success);
      })
      .catch(err => {
        console.error(err);
      });
  }
  async sendEmailForgotPassword(user: UserMongo, token: string) {
    this.mailerService
      .sendMail({
        to: user.email,
        from: 'DUCTT-UET <trantienduc10@gmail.com>', // Senders email address
        subject: `[MEMO] Đặt lại mật khẩu của bạn`,
        context: {
          link: `${this.config.get<string>(
            'service.domainClient',
          )}/forgot-password?token=${token}&name=${user.name || user.username}${
            user.picture ? `&picture=${user.picture}` : ''
          }`,
        },
        template: 'forgotPassword',
      })
      .then(async success => {
        console.log(success);
      })
      .catch(err => {
        console.error(err);
      });
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async cronTaskCrawlBaomoi() {
    const categories = await this.categoryService.getAllCategories();
    const configs = await this.configService.getAllConfigs();
    const baomoiCategories = categories
      .filter(el => el.type === 'BAO_MOI')
      .map(el => el.id);
    const baomoiCategoryConfigs = configs.filter(el =>
      baomoiCategories.includes((el.category as any).id),
    );
    for (let i = 0; i < baomoiCategoryConfigs.length; i++) {
      await this.crawlOneConfig(baomoiCategoryConfigs[i]);
    }
  }

  async crawlOneConfig(categoryConfig: any) {
    const { config, category } = categoryConfig;
    const startUrl = JSON.parse(config).startUrl;
    let allArticles = [];
    for (let i = 1; i <= 3; i++) {
      const page = startUrl.replace('{page}', i);
      const data = await fetch(page);
      const $ = cheerio.load(await data.text());
      const listArticles = $('.story').toArray();
      const articles = await Bluebird.map(
        listArticles,
        async ele => {
          const title = $('h4.story__heading a', ele)
            .first()
            .text();
          const url = $('h4.story__heading a', ele)
            .first()
            .attr('href');
          const image = $('img.lazy-img', ele)
            .first()
            .attr('data-src');
          const dateString = $('time.time', ele)
            .first()
            .attr('datetime');
          const publishDate = new Date(dateString);
          if (!!url) {
            const mainArticle = await fetch(`https://baomoi.com${url}`);
            const html = await mainArticle.text();
            const child = cheerio.load(html);
            const description = child('meta[name=description]')
              .first()
              .attr('content');
            const match = html.match(/window.location.replace\(".*?"\);/g);
            const fullUrl = match[0].substring(25, match[0].length - 3);
            return {
              title,
              publishDate,
              image,
              url: fullUrl,
              website: new URL(fullUrl).origin,
              web: new URL(fullUrl).origin,
              description,
            };
          }
          return null;
        },
        { concurrency: 5 },
      );
      allArticles = allArticles.concat(articles.filter(Boolean));
    }
    for (let i = 0; i < allArticles.length; i++) {
      await this.articleService.createIfUrlNotExist({
        ...allArticles[i],
        category,
      });
    }
  }
}

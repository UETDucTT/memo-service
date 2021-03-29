import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { User as UserMongo } from 'src/auth/auth.schema';

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => AuthService))
    private readonly userService: AuthService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
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
          )}confirm-register?token=${token}`,
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
          )}forgot-password?token=${token}&name=${user.name || user.username}${
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
}

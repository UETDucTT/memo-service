import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Diary } from 'src/diary/diary.entity';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { AuthService } from 'src/auth/auth.service';
import { In } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private config: ConfigService,
  ) {}
  async sendEmailShareDiary(diary: Diary, emails: string[]) {
    const users = await this.userService.find({
      where: { email: In(emails) },
    });
    if (users && users.length) {
      this.notificationGateway.sendToUser(
        users.map(el => el.id.toString()),
        {
          diary,
        },
      );
      const notifications = users.map(el => {
        return {
          user: el,
          data: JSON.stringify({
            type: 'INVITE_VIEW_DIARY',
            diary,
          }),
        };
      });
      this.notificationService.bulkCreateNotification(notifications);
    }
    const emailSendByMailService = emails.filter(
      el => !users.map(item => item.email).includes(el),
    );
    if (emailSendByMailService.length) {
      this.mailerService
        .sendMail({
          to: emailSendByMailService,
          from: 'DUCTT-UET <trantienduc10@gmail.com>', // Senders email address
          subject: `❤️❤️❤️ Thư mời xem nhật ký của ${diary.user.name} ❤️❤️❤️`,
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
}

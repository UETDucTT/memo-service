import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Diary } from 'src/diary/diary.entity';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: AuthService,
    private readonly notificationGateway: NotificationGateway,
    private config: ConfigService,
  ) {}
  sendEmailShareDiary(diary: Diary, emails: string[]) {
    this.mailerService
      .sendMail({
        to: emails,
        from: 'DUCTT-UET <trantienduc10@gmail.com>', // Senders email address
        subject: `❤️❤️❤️ Thư mời xem nhật ký của ${diary.user.name} ❤️❤️❤️`,
        context: {
          name: diary.user.name,
          link: `${this.config.get<string>('service.domainClient')}share?ref=${
            diary.id
          }`,
        },
        template: 'shareDiary',
      })
      .then(async success => {
        const users = await this.userService.find({
          where: { email: { in: emails } },
        });
        if (users && users[0]) {
          this.notificationGateway.sendToUser(
            users[0].id.toString(),
            `${diary.user.name} đã mời bạn xem nhật ký của anh (cô) ấy`,
          );
        }
        console.log(success);
      })
      .catch(err => {
        console.error(err);
      });
  }

  // @Interval(5000)
  // handleInterval() {
  //   this.notificationGateway.sendToUser('trantienduc10@gmail.com', 'ahihi');
  // }
}

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Diary } from 'src/diary/diary.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
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
      .then(success => {
        console.log(success);
      })
      .catch(err => {
        console.error(err);
      });
  }
}

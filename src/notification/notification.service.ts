import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/auth.entity';
import { SearchNotificationDto } from './notification.dto';

interface NotificationCreateWithUser {
  data: any;
  seen?: boolean;
  user: User;
}

type SearchNotificationDtoWithUser = SearchNotificationDto & {
  user: User;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async bulkCreateNotification(notifications: NotificationCreateWithUser[]) {
    return await Promise.all(
      notifications.map(el => this.notificationRepo.save(el)),
    );
  }

  async getNotifications(params: SearchNotificationDtoWithUser) {
    let { page, pageSize, lastId, user } = params;
    if (!lastId && !page) {
      page = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }

    const [, totalHNotSeen] = await this.notificationRepo.findAndCount({
      where: {
        user: {
          id: user.id,
        },
        seen: false,
      },
    });

    if (page) {
      const result = await this.notificationRepo.findAndCount({
        where: {
          user: {
            id: user.id,
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { createdAt: 'DESC' },
      });
      const [next] = await this.notificationRepo.findAndCount({
        where: {
          user: {
            id: user.id,
          },
        },
        skip: page * pageSize,
        take: 1,
        order: { createdAt: 'DESC' },
      });
      const hasMore = !!next.length;
      return {
        result,
        hasMore,
        totalHNotSeen,
      };
    } else {
      const allElement = await this.notificationRepo.find({
        where: {
          user: {
            id: user.id,
          },
        },
        order: { createdAt: 'DESC' },
      });
      const idx = allElement.findIndex(el => el.id === lastId);
      if (idx !== -1) {
        const result = await this.notificationRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
          },
          skip: idx + 1,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.notificationRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
          },
          skip: idx + 1 + pageSize,
          take: 1,
          order: { createdAt: 'DESC' },
        });
        const hasMore = !!next.length;
        return {
          result,
          hasMore,
          totalHNotSeen,
        };
      } else {
        const result = await this.notificationRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
          },
          skip: 0,
          take: pageSize,
          order: { createdAt: 'DESC' },
        });
        const [next] = await this.notificationRepo.findAndCount({
          where: {
            user: {
              id: user.id,
            },
          },
          skip: pageSize,
          take: 1,
          order: { createdAt: 'DESC' },
        });
        const hasMore = !!next.length;
        return {
          result,
          hasMore,
          totalHNotSeen,
        };
      }
    }
  }

  async markAllSeen(userId: number) {
    return await this.notificationRepo.update(
      { user: { id: userId } },
      { seen: true },
    );
  }
}

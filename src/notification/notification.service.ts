import { Injectable } from '@nestjs/common';
import { SearchNotificationDto } from './notification.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification as NotificationMongo,
  NotificationDocument,
} from './notification.schema';

interface NotificationCreateWithUser {
  data: any;
  seen: boolean;
  user: string;
}

type SearchNotificationDtoWithUser = SearchNotificationDto & {
  user: string;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationMongo.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async bulkCreateNotification(notifications: NotificationCreateWithUser[]) {
    return await this.notificationModel.insertMany(notifications);
  }

  async getNotifications(params: SearchNotificationDtoWithUser) {
    let { pageSize, lastId, user } = params;
    if (!pageSize) {
      pageSize = 10;
    }

    const totalHNotSeen = await this.notificationModel
      .find({
        $and: [{ user }, { seen: false }],
      })
      .countDocuments()
      .exec();

    if (!lastId) {
      return [
        await (this.notificationModel as any).paginate(
          {
            user,
          },
          {
            page: 1,
            limit: pageSize,
            populate: 'user',
            sort: '-createdAt',
          },
        ),
        totalHNotSeen,
      ];
    } else {
      const allElements = await this.notificationModel
        .find({
          user,
        })
        .sort('-createdAt')
        .exec();
      const idx = allElements.findIndex(el => el.id === lastId);
      return [
        await (this.notificationModel as any).paginate(
          {
            user,
          },
          {
            offset: idx + 1,
            limit: pageSize,
            populate: 'user',
            sort: '-createdAt',
          },
        ),
        totalHNotSeen,
      ];
    }
  }

  async markAllSeen(userId: string) {
    return await this.notificationModel.updateMany(
      { $and: [{ user: userId }, { seen: false }] },
      { seen: true },
    );
  }

  async markSeen(id: string, userId: string) {
    return await this.notificationModel.findOneAndUpdate(
      { $and: [{ _id: id }, { user: userId }] },
      { seen: true },
    );
  }
}

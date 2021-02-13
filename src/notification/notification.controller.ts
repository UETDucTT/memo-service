import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  Query,
  Put,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchNotificationDto, ParamNotiDto } from './notification.dto';
import { AuthMeta } from 'src/auth/auth.decorator';
import { NotificationService } from './notification.service';
import { TransformResponse, NotificationsResponse } from './notification.model';

@Controller('notifications')
@ApiTags('Notification Action')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get([''])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list notifications',
    type: TransformResponse(NotificationsResponse),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDiaries(
    @AuthMeta() user,
    @Query() dto: SearchNotificationDto,
  ): Promise<NotificationsResponse> {
    const [
      { docs, hasNextPage: hasMore, totalDocs },
      totalHNotSeen,
    ] = await this.notificationService.getNotifications({
      ...dto,
      user: user.id,
    });
    return {
      notifications: docs,
      totalHNotSeen,
      pagination: {
        totalItems: totalDocs,
        hasMore,
      },
    };
  }

  @Put(['/mark-all-seen'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Mark all have seen',
  })
  async markAllSeen(@AuthMeta() user): Promise<any> {
    await this.notificationService.markAllSeen(user.id);
    return {
      ok: true,
    };
  }

  @Put(['/mark-seen/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Update notification',
  })
  async updateSeen(
    @Param() params: ParamNotiDto,
    @AuthMeta() user,
  ): Promise<any> {
    await this.notificationService.markSeen(params.id, user.id);
    return {
      ok: true,
    };
  }
}

import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchNotificationDto } from './notification.dto';
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
    const {
      result,
      hasMore,
      totalHNotSeen,
    } = await this.notificationService.getNotifications({
      ...dto,
      user,
    });
    const [list, cnt] = result;
    return {
      notifications: list,
      totalHNotSeen,
      pagination: {
        totalItems: cnt,
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
}

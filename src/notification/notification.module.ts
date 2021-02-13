import {
  Module,
  Global,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { NotificationController } from './notification.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification as NotificationMongo,
  NotificationSchema,
} from './notification.schema';

NotificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

NotificationSchema.set('toJSON', {
  virtuals: true,
});

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationMongo.name, schema: NotificationSchema },
    ]),
    TypeOrmModule.forFeature([Notification]),
    IdentityModule,
    forwardRef(() => AuthModule),
  ],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes(NotificationController);
  }
}

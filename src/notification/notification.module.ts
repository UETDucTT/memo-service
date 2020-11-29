import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { NotificationController } from './notification.controller';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    IdentityModule,
    AuthModule,
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

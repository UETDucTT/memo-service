import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { UploadService } from './upload.service';
import { AuthModule } from 'src/auth/auth.module';
import { UploadController } from './upload.controller';
import { IdentityModule } from 'src/identity/identity.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule), IdentityModule],
  providers: [UploadService],
  exports: [UploadService],
  controllers: [UploadController],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes(UploadController);
  }
}

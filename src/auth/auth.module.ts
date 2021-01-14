import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './auth.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { TagModule } from 'src/tag/tag.module';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    IdentityModule,
    forwardRef(() => TagModule),
    forwardRef(() => TaskModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes('auth/me');
  }
}

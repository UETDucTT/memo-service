import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './auth.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { TagModule } from 'src/tag/tag.module';
import { TaskModule } from 'src/task/task.module';
import { DiaryShareModule } from 'src/diary-share/diary-share.module';
import { ConfigModule } from '@nestjs/config';
import { User as UserMongo, UserSchema } from './auth.schema';

UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserMongo.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([User]),
    IdentityModule,
    forwardRef(() => TagModule),
    forwardRef(() => TaskModule),
    forwardRef(() => DiaryShareModule),
    forwardRef(() => ConfigModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IdentityMiddleware)
      .forRoutes('auth/me', 'auth/all-users', 'auth/shared-emails');
  }
}

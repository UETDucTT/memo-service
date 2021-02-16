import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { IdentityModule } from 'src/identity/identity.module';
import { AuthModule } from 'src/auth/auth.module';
import { Tag as TagMongo, TagSchema } from './tag.schema';

TagSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

TagSchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TagMongo.name, schema: TagSchema }]),
    IdentityModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes(TagController);
  }
}

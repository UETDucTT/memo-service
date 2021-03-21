import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { IdentityModule } from 'src/identity/identity.module';
import { AuthModule } from 'src/auth/auth.module';
import { Article, ArticleSchema } from './article.schema';

ArticleSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ArticleSchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    IdentityModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}

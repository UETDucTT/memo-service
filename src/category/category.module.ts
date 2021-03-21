import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { IdentityModule } from 'src/identity/identity.module';
import { AuthModule } from 'src/auth/auth.module';
import { Category, CategorySchema } from './category.schema';

CategorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    IdentityModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes(CategoryController);
  }
}

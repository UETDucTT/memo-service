import {
  Module,
  NestModule,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from './config.controller';
import { CrawlConfigService } from './config.service';
import { IdentityMiddleware } from 'src/identity/identity.middleware';
import { IdentityModule } from 'src/identity/identity.module';
import { AuthModule } from 'src/auth/auth.module';
import { Config, ConfigSchema } from './config.schema';
import { CategoryModule } from 'src/category/category.module';

ConfigSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ConfigSchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    IdentityModule,
    forwardRef(() => AuthModule),
    forwardRef(() => CategoryModule),
  ],
  controllers: [ConfigController],
  providers: [CrawlConfigService],
  exports: [CrawlConfigService],
})
export class CrawlConfigModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes(ConfigController);
  }
}

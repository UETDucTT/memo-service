import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import identityConfig from './config/identity.config';
import serviceConfig from './config/service.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DiaryModule } from './diary/diary.module';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot({
      load: [serviceConfig, identityConfig],
    }),
    HealthModule,
    AuthModule,
    DiaryModule,
    ResourceModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}

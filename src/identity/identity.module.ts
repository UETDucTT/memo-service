import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityService } from './identity.service';

@Module({
  imports: [ConfigModule],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}

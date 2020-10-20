import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory(config: ConfigService) {
        const jwtSecretKey = config.get<string>('identity.jwtSecretKey');
        return {
          secret: jwtSecretKey,
          signOptions: { expiresIn: '86400s' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}

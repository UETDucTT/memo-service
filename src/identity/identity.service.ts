import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

@Injectable()
export class IdentityService {
  constructor(private config: ConfigService) {}

  decodeUserToken(token: string): any {
    return jwt.verify(token, this.config.get<string>('identity.jwtSecretKey'));
  }

  generateUserToken(id: number) {
    return {
      token: jwt.sign(
        {
          cid: id,
        },
        this.config.get<string>('identity.jwtSecretKey'),
        { expiresIn: '604800s' },
      ),
    };
  }

  generateTokenConfirmRegister(email: string, expiredSecond: number) {
    return {
      token: jwt.sign(
        {
          cid: email,
        },
        this.config.get<string>('identity.jwtSecretKey'),
        { expiresIn: `${expiredSecond}s` },
      ),
    };
  }
}

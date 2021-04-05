import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

@Injectable()
export class IdentityService {
  constructor(private config: ConfigService) {}

  decodeUserToken(token: string): any {
    return jwt.verify(token, this.config.get<string>('identity.jwtSecretKey'));
  }

  generateUserToken(id: any) {
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

  generateTokenConfirmRegister(
    email: string,
    expiredSecond: number,
    suffixKey: string,
  ) {
    return {
      token: jwt.sign(
        {
          cid: email,
        },
        this.config.get<string>('identity.jwtSecretKey') + suffixKey,
        { expiresIn: `${expiredSecond}s` },
      ),
    };
  }
}

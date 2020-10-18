import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserTokenPayload } from './identity.model';

@Injectable()
export class IdentityService {
  constructor(private jwtService: JwtService) {}

  decodeUserToken(token: string): UserTokenPayload {
    return this.jwtService.verify(token);
  }

  generateUserToken(id: number) {
    return {
      token: this.jwtService.sign({
        cid: id,
        iat: Date.now(),
      }),
    };
  }
}

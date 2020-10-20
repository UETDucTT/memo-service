import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IdentityService } from './identity.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class IdentityMiddleware implements NestMiddleware {
  constructor(
    private identityService: IdentityService,
    private authService: AuthService,
  ) {}
  async use(request: Request, res: Response, next: NextFunction) {
    try {
      const token = request.headers['authorization'] as string;
      if (token && token.split(' ').length === 2) {
        console.log(token.split(' ')[1]);
        const { cid } = this.identityService.decodeUserToken(
          token.split(' ')[1],
        );
        const user = this.authService.findOne({ where: { id: cid } });
        console.log(user);
        if (user) {
          (request as any).user = user;
          next();
          return;
        }
      }
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (err) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import { IdentityService } from './identity.service';
import { Repository } from 'typeorm';
import { User } from 'src/auth/auth.entity';

@Injectable()
export class IdentityMiddleware implements NestMiddleware {
  constructor(
    private identityService: IdentityService,
    @InjectRepository(User)
    private readonly authRepo: Repository<User>,
  ) {}
  async use(request: Request, res: Response, next: NextFunction) {
    try {
      const token = request.headers['authorization'] as string;
      if (token && token.split(' ').length === 2) {
        console.log(token.split(' ')[1]);
        const { cid } = this.identityService.decodeUserToken(
          token.split(' ')[1],
        );
        const user = await this.authRepo.findOne({ where: { id: cid } });
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

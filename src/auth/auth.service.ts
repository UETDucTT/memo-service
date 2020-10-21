import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { IdentityService } from '../identity/identity.service';
import { GetSampleTokenDto } from './auth.dto';
import { User } from './auth.entity';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectRepository(User)
    private readonly authRepo: Repository<User>,
    private readonly identityService: IdentityService,
  ) {
    this.client = new OAuth2Client(
      '335058615265-gcce2lv24jgadcjv20oblhlav3s0caik.apps.googleusercontent.com',
    );
  }

  async loginGoogle(token?: string) {
    const ticket = await this.client.verifyIdToken({ idToken: token });
    const user = await this.authRepo.findOne({
      where: { sub: ticket.getUserId() },
    });
    if (!user) {
      const {
        email,
        name,
        picture,
        sub,
        given_name: givenName,
        family_name: familyName,
      } = ticket.getPayload();
      const newUser = await this.authRepo.save({
        email,
        name,
        picture,
        sub,
        givenName,
        familyName,
      });
      return this.identityService.generateUserToken(newUser.id);
    }
    return this.identityService.generateUserToken(user.id);
  }

  async getTokenSample(params: GetSampleTokenDto) {
    const { email, passwordSystem } = params;
    if (passwordSystem !== 'test') {
      return Promise.reject(new Error('Password wrong, contact DUCTT'));
    }
    const user = await this.authRepo.findOne({ where: { email } });
    if (!user) {
      return Promise.reject(new Error('Email not exist, contact DUCTT'));
    }
    return this.identityService.generateUserToken(user.id);
  }

  async findOne(condition: any): Promise<User> {
    return await this.authRepo.findOne(condition);
  }
}

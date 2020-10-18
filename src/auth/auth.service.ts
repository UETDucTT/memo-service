import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { IdentityService } from '../identity/identity.service';
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
      console.log(newUser);
      return this.identityService.generateUserToken(newUser.id);
    }
    return this.identityService.generateUserToken(user.id);
  }
}

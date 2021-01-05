import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { TagService, CreateTagDtoWithUser } from 'src/tag/tag.service';
import { Repository } from 'typeorm';
import { IdentityService } from '../identity/identity.service';
import { GetSampleTokenDto, UpdateProfileDto } from './auth.dto';
import { User } from './auth.entity';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectRepository(User)
    private readonly authRepo: Repository<User>,
    private readonly identityService: IdentityService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
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
      const newTags = [
        { name: 'Công việc', isDefault: true, color: '#009EFF' },
        { name: 'Gia đình', isDefault: true, color: '#FF1300' },
        { name: 'Học tập', isDefault: true, color: '#B900FF' },
        { name: 'Chuyến đi', isDefault: true, color: '#45CF09' },
        { name: 'Tình yêu', isDefault: true, color: '#FF0080' },
      ].map(el => ({
        ...el,
        user: newUser,
      })) as CreateTagDtoWithUser[];
      await Promise.all(newTags.map(el => this.tagService.create(el)));
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

  async find(condition: any): Promise<User[]> {
    return await this.authRepo.find(condition);
  }

  async update(id: number, params: UpdateProfileDto) {
    return await this.authRepo.update({ id }, params);
  }
}

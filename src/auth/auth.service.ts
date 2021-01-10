import {
  Injectable,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { TagService, CreateTagDtoWithUser } from 'src/tag/tag.service';
import { Repository, Not } from 'typeorm';
import { IdentityService } from '../identity/identity.service';
import {
  GetSampleTokenDto,
  LoginDto,
  UpdateProfileDto,
  RegisterDto,
} from './auth.dto';
import { User } from './auth.entity';
import bcrypt from 'bcrypt';

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
    const {
      email,
      name,
      picture,
      sub,
      given_name: givenName,
      family_name: familyName,
    } = ticket.getPayload();
    const user = await this.authRepo.findOne({
      where: [{ sub: ticket.getUserId() }, { email }],
    });
    if (!user) {
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
    if (!user.sub) {
      await this.authRepo.save({
        ...user,
        sub: ticket.getUserId(),
        givenName,
        familyName,
        picture: user.picture ? user.picture : picture,
        name: user.name ? user.name : name,
      });
    }
    return this.identityService.generateUserToken(user.id);
  }

  async login(params: LoginDto) {
    const user = await this.authRepo.findOne({
      where: [
        { username: params.usernameOrEmail },
        { email: params.usernameOrEmail },
      ],
    });
    if (!user) {
      throw new HttpException(
        'Username, Email or Password is wrong',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isValid = await bcrypt.compare(params.password, user.password || '');
    if (!isValid) {
      throw new HttpException(
        'Username, Email or Password is wrong',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.identityService.generateUserToken(user.id);
  }

  async register(params: RegisterDto) {
    const user = await this.authRepo.findOne({
      where: [{ username: params.username }, { email: params.email }],
    });
    if (user) {
      throw new HttpException('User existed', HttpStatus.CONFLICT);
    }
    const pwd = await bcrypt.hash(params.password, 10);
    const newUser = await this.authRepo.save({
      email: params.email,
      username: params.username,
      password: pwd,
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
    return newUser;
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
    if (params.username) {
      const user = await this.authRepo.findOne({
        where: { id: Not(id), username: params.username },
      });
      if (user) {
        throw new HttpException(
          'Tên tài khoản đã tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return await this.authRepo.update({ id }, params);
  }

  async getAllUser() {
    return await this.authRepo.find();
  }
}

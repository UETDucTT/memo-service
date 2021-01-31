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
import { RedisService } from 'src/redis/redis.service';
import { TaskService } from 'src/task/task.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectRepository(User)
    private readonly authRepo: Repository<User>,
    private readonly identityService: IdentityService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    @Inject(forwardRef(() => ConfigService))
    private config: ConfigService,
  ) {
    this.client = new OAuth2Client(
      '335058615265-gcce2lv24jgadcjv20oblhlav3s0caik.apps.googleusercontent.com',
    );
  }

  async getDb() {
    return this.redisService.getClient('main');
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
      if (this.config.get<number>('service.limitLogin')) {
        throw new HttpException(
          'Liên hệ với admin và thử lại',
          HttpStatus.FORBIDDEN,
        );
      }
      const db = await this.getDb();
      const items = await db.keys('verify_*');
      for (let i = 0; i < items.length; i++) {
        const data = await db.get(items[i]);
        const userTemp = JSON.parse(data);
        if (userTemp?.email === email) {
          await db.del(items[i]);
        }
      }
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
    const db = await this.getDb();
    const items = await db.keys('verify_*');
    for (let i = 0; i < items.length; i++) {
      const data = await db.get(items[i]);
      const userTemp = JSON.parse(data);
      if (
        userTemp?.email === params.usernameOrEmail ||
        userTemp?.username === params.usernameOrEmail
      ) {
        throw new HttpException(
          'Tài khoản đang chờ xác thực. Kiểm tra Email của bạn ngay',
          HttpStatus.CONFLICT,
        );
      }
    }
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
    const db = await this.getDb();
    const items = await db.keys('verify_*');
    for (let i = 0; i < items.length; i++) {
      const data = await db.get(items[i]);
      const userTemp = JSON.parse(data);
      if (userTemp?.email === params.email) {
        throw new HttpException(
          'Tài khoản đang chờ xác thực. Kiểm tra Email của bạn ngay',
          HttpStatus.CONFLICT,
        );
      }
    }
    const user = await this.authRepo.findOne({
      where: [{ username: params.username }, { email: params.email }],
    });
    if (this.config.get<number>('service.limitLogin')) {
      throw new HttpException(
        'Liên hệ với admin và thử lại',
        HttpStatus.FORBIDDEN,
      );
    }
    if (user) {
      throw new HttpException('Tên TK / Email đã tồn tại', HttpStatus.CONFLICT);
    }
    const pwd = await bcrypt.hash(params.password, 10);
    const tokenConfirmRegister = this.identityService.generateTokenConfirmRegister(
      params.email,
      86400,
    );
    await db.set(
      `veriry_${tokenConfirmRegister.token}`,
      JSON.stringify({
        email: params.email,
        username: params.username,
        password: pwd,
        cnt: 0,
      }),
      'EX',
      86400,
    );
    this.taskService.sendEmailVerifyAccount(
      {
        email: params.email,
        username: params.username,
      },
      `veriry_${tokenConfirmRegister.token}`,
    );
    // const newUser = await this.authRepo.save({
    //   email: params.email,
    //   username: params.username,
    //   password: pwd,
    // });
    // const newTags = [
    //   { name: 'Công việc', isDefault: true, color: '#009EFF' },
    //   { name: 'Gia đình', isDefault: true, color: '#FF1300' },
    //   { name: 'Học tập', isDefault: true, color: '#B900FF' },
    //   { name: 'Chuyến đi', isDefault: true, color: '#45CF09' },
    //   { name: 'Tình yêu', isDefault: true, color: '#FF0080' },
    // ].map(el => ({
    //   ...el,
    //   user: newUser,
    // })) as CreateTagDtoWithUser[];
    // await Promise.all(newTags.map(el => this.tagService.create(el)));
    return { id: 0 };
  }

  async confirmRegister(token: string) {
    const db = await this.getDb();
    const item = await db.get(token);
    if (!item) {
      throw new HttpException(
        'Không có yêu cầu xác thực hoặc yêu cầu xác thực đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = JSON.parse(item);
    if (user?.cnt > 0) {
      await db.del(token);
      throw new HttpException(
        'Yêu cầu xác thực chỉ chấp nhận lần đầu tiên',
        HttpStatus.BAD_REQUEST,
      );
    }
    delete user?.cnt;
    const newUser = await this.authRepo.save(user);
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
    await db.del(token);
    return newUser;
  }

  async requestForgotPassword(email: string) {
    const db = await this.getDb();
    const user = await this.authRepo.findOne({
      where: { email },
    });
    if (!user) {
      throw new HttpException(
        'Email không tồn tại trong hệ thống',
        HttpStatus.NOT_FOUND,
      );
    }
    const tokenForgotPassword = this.identityService.generateTokenConfirmRegister(
      user.email,
      3600,
    );
    await db.set(
      `forgot_password_${tokenForgotPassword.token}`,
      JSON.stringify({
        email: user.email,
        cnt: 0,
      }),
      'EX',
      3600,
    );
    this.taskService.sendEmailForgotPassword(
      user,
      `forgot_password_${tokenForgotPassword.token}`,
    );
    return { id: user.id };
  }

  async resetPassword(token: string, newPassword: string) {
    const db = await this.getDb();
    const item = await db.get(token);
    if (!item) {
      throw new HttpException(
        'Không có yêu cầu quên mật khẩu hoặc yêu cầu đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = JSON.parse(item);
    if (user?.cnt > 0) {
      await db.del(token);
      throw new HttpException(
        'Yêu cầu quên mật khẩu chỉ chấp nhận gửi lần đầu tiên',
        HttpStatus.BAD_REQUEST,
      );
    }
    const pwd = await bcrypt.hash(newPassword, 10);
    const userUpdate = await this.authRepo.findOne({
      where: { email: user?.email },
    });
    if (!userUpdate) {
      throw new HttpException('Error', HttpStatus.NOT_FOUND);
    }
    await this.authRepo.save({ ...userUpdate, password: pwd });
    await db.del(token);
    return { id: userUpdate.id };
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

import {
  Injectable,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { TagService, CreateTagDtoWithUser } from 'src/tag/tag.service';
import { IdentityService } from '../identity/identity.service';
import {
  GetSampleTokenDto,
  LoginDto,
  UpdateProfileDto,
  RegisterDto,
} from './auth.dto';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from 'src/redis/redis.service';
import { TaskService } from 'src/task/task.service';
import { ConfigService } from '@nestjs/config';
import { User as UserMongo, UserDocument } from './auth.schema';
import * as admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

@Injectable()
export class AuthService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    @Inject(forwardRef(() => ConfigService))
    private config: ConfigService,
    @InjectModel(UserMongo.name)
    private userModel: Model<UserDocument>,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  }

  async getDb() {
    return this.redisService.getClient('main');
  }

  async loginGoogle(token?: string) {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture, sub } = decodedToken;
    const user = await this.userModel
      .findOne({
        $or: [{ key: sub }, { email }],
      })
      .exec();
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
      const newUserObj = new this.userModel({
        email,
        name,
        picture,
        key: sub,
      });
      const newUser = await newUserObj.save();
      const newTags = [
        { name: 'Công việc', isDefault: true, color: '#009EFF' },
        { name: 'Gia đình', isDefault: true, color: '#FF1300' },
        { name: 'Học tập', isDefault: true, color: '#B900FF' },
        { name: 'Chuyến đi', isDefault: true, color: '#45CF09' },
        { name: 'Tình yêu', isDefault: true, color: '#FF0080' },
      ].map(el => ({
        ...el,
        user: newUser.id,
      })) as CreateTagDtoWithUser[];
      await Promise.all(newTags.map(el => this.tagService.create(el)));
      return this.identityService.generateUserToken(newUser.id);
    }
    if (!user.key) {
      user.key = sub;
      user.picture = user.picture ? user.picture : picture;
      user.name = user.name ? user.name : name;
      await user.save();
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
    const user = await this.userModel
      .findOne({
        $or: [
          { username: params.usernameOrEmail },
          { email: params.usernameOrEmail },
        ],
      })
      .select('username email password')
      .exec();
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
    const user = await this.userModel
      .findOne({
        $or: [{ username: params.username }, { email: params.email }],
      })
      .exec();
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
      'register',
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
    const userCreated = new this.userModel(user);
    const newUser = await userCreated.save();
    const newTags = [
      { name: 'Công việc', isDefault: true, color: '#009EFF' },
      { name: 'Gia đình', isDefault: true, color: '#FF1300' },
      { name: 'Học tập', isDefault: true, color: '#B900FF' },
      { name: 'Chuyến đi', isDefault: true, color: '#45CF09' },
      { name: 'Tình yêu', isDefault: true, color: '#FF0080' },
    ].map(el => ({
      ...el,
      user: newUser.id,
    })) as CreateTagDtoWithUser[];
    await Promise.all(newTags.map(el => this.tagService.create(el)));
    await db.del(token);
    return newUser;
  }

  async requestForgotPassword(email: string) {
    const db = await this.getDb();
    const user = await this.userModel
      .findOne({
        email,
      })
      .exec();
    if (!user) {
      throw new HttpException(
        'Email không tồn tại trong hệ thống',
        HttpStatus.NOT_FOUND,
      );
    }
    const tokenForgotPassword = this.identityService.generateTokenConfirmRegister(
      user.email,
      3600,
      'forgot_password',
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
    const userUpdate = await this.userModel
      .findOneAndUpdate(
        {
          email: user?.email,
        },
        { password: pwd },
      )
      .exec();
    await db.del(token);
    return { id: userUpdate.id };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.userModel
      .findOne({
        _id: userId,
      })
      .select('username email password')
      .exec();
    if (!user) {
      throw new HttpException(
        'Username, Email or Password is wrong',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isValid = await bcrypt.compare(oldPass, user.password || '');
    if (!isValid) {
      throw new HttpException('Old password is wrong', HttpStatus.BAD_REQUEST);
    }
    const pwd = await bcrypt.hash(newPass, 10);
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { password: pwd },
      {
        strict: false,
      },
    );
  }

  async getTokenSample(params: GetSampleTokenDto) {
    const { email, passwordSystem } = params;
    if (passwordSystem !== 'ductt97') {
      return Promise.reject(new Error('Password wrong, contact DUCTT'));
    }
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      return Promise.reject(new Error('Email not exist, contact DUCTT'));
    }
    return this.identityService.generateUserToken(user.id);
  }

  async findOne(condition: any): Promise<UserDocument> {
    return await this.userModel.findOne(condition).exec();
  }

  async findById(id: any): Promise<any> {
    return await this.userModel.findById(id).select('-password');
  }

  async find(condition: any): Promise<any> {
    return await this.userModel.find(condition);
  }

  async update(id: string, params: UpdateProfileDto) {
    if (params.username) {
      const user = await this.userModel
        .findOne({
          $and: [{ username: params.username }, { _id: { $ne: id } }],
        })
        .exec();
      if (user) {
        throw new HttpException(
          'Tên tài khoản đã tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return await this.userModel.findOneAndUpdate({ _id: id }, params, {
      strict: false,
    });
  }

  async getAllUser() {
    return await this.userModel.find().select('-password');
  }
}

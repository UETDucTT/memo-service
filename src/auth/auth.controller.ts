import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TransformResponse, SystemToken, IDToken } from './auth.model';
import { AuthMeta } from './auth.decorator';
import {
  GetSampleTokenDto,
  UpdateProfileDto,
  LoginDto,
  RegisterDto,
} from './auth.dto';
import { User } from './auth.entity';
import { OnlyId, UserOverviewResponse } from 'src/diary/diary.model';
import { TransformInterceptor } from './transform.inteceptor';

@Controller('auth')
@ApiTags('Auth management')
@UseInterceptors(new TransformInterceptor())
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(['get-token'])
  @ApiResponse({
    status: 200,
    description: 'Token from server',
    type: TransformResponse(SystemToken),
  })
  async loginGoogle(@Body() req: IDToken): Promise<SystemToken> {
    try {
      const res = await this.authService.loginGoogle(req.idToken);
      return res;
    } catch (err) {
      if (err.message) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(['login'])
  @ApiResponse({
    status: 200,
    description: 'Token from server',
    type: TransformResponse(SystemToken),
  })
  async login(@Body() req: LoginDto): Promise<SystemToken> {
    const res = await this.authService.login(req);
    return res;
  }

  @Post(['register'])
  @ApiResponse({
    status: 200,
    description: 'Token from server',
    type: TransformResponse(OnlyId),
  })
  async register(@Body() req: RegisterDto): Promise<OnlyId> {
    const res = await this.authService.register(req);
    return {
      id: res.id,
    };
  }

  @Post(['get-token-sample'])
  @ApiResponse({
    status: 200,
    description: 'Token from server',
    type: TransformResponse(SystemToken),
  })
  async getSampleToken(@Body() req: GetSampleTokenDto): Promise<SystemToken> {
    try {
      const res = await this.authService.getTokenSample(req);
      return res;
    } catch (err) {
      if (err.message) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(['me'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'User info',
    type: TransformResponse(User),
  })
  getMe(@AuthMeta() user): User {
    return user;
  }

  @Get(['/all-users'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Get all user',
    type: TransformResponse(UserOverviewResponse),
  })
  async getAllUsers(@AuthMeta() _user): Promise<UserOverviewResponse> {
    const users = await this.authService.getAllUser();
    return { users };
  }

  @Patch(['me/update'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'User info',
    type: TransformResponse(OnlyId),
  })
  async updateProfile(
    @AuthMeta() user,
    @Body() req: UpdateProfileDto,
  ): Promise<OnlyId> {
    await this.authService.update(user.id, req);
    return {
      id: user.id,
    };
  }
}

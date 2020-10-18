import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TransformResponse, SystemToken, IDToken } from './auth.model';
import { AuthMeta } from './auth.decorator';
import { User } from './auth.entity';

@Controller('auth')
@ApiTags('Auth management')
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
}

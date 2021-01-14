import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,20}$/, {
    message: 'Tên TK từ 6 đến 20 ký tự, chỉ bao gồm chữ số & chữ cái',
  })
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,20}$/, {
    message: 'Mật khẩu từ 6 đến 20 ký tự, chỉ bao gồm chữ số & chữ cái',
  })
  password: string;
}

export class GetSampleTokenDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  passwordSystem: string;
}

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  givenName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  familyName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,20}$/, {
    message: 'Tên TK từ 6 đến 20 ký tự, chỉ bao gồm chữ số & chữ cái',
  })
  username: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  picture: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthday: string;
}

export class RequestForgotPasswordDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  token: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,20}$/, {
    message: 'Mật khẩu từ 6 đến 20 ký tự, chỉ bao gồm chữ số & chữ cái',
  })
  newPassword: string;
}

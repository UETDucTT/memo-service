import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';

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

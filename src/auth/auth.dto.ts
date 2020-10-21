import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsString,
  IsEmail,
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
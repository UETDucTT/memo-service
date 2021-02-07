import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// export type DiaryDocument = Cat & Document;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  @Prop()
  @ApiProperty()
  key: string;

  @Prop({ required: true })
  @ApiProperty()
  email: string;

  @Prop()
  @ApiProperty()
  name: string;

  @Prop()
  @ApiProperty()
  picture: string;

  @Prop()
  @ApiProperty()
  gender: string;

  @Prop()
  @ApiProperty()
  birthday: Date;

  @Prop()
  @ApiProperty()
  username: string;

  @Prop()
  @ApiProperty({ writeOnly: true })
  password: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

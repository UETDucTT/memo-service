import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../auth/auth.schema';
import mongoose from 'mongoose';

@Schema({
  collection: 'tags',
  timestamps: true,
})
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  isDefault: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string;
}

export type TagDocument = Tag & Document;

export const TagSchema = SchemaFactory.createForClass(Tag);

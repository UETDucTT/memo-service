import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'shares',
  timestamps: true,
})
export class Share {
  @Prop({ required: true })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Diary', required: true })
  diary: string;
}

export type ShareDocument = Share & Document;

export const ShareSchema = SchemaFactory.createForClass(Share);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'shares',
  timestamps: true,
})
export class Share {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  receiver: string;

  @Prop({ required: false })
  receiverEmail: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Diary', required: true })
  record: string;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: false, type: String, default: 'view' })
  action: string;
}

export type ShareDocument = Share & Document;

export const ShareSchema = SchemaFactory.createForClass(Share);

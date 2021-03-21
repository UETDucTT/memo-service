import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'configs',
  timestamps: true,
})
export class Config {
  @Prop({ type: Object, required: true })
  config: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: string;
}

export type ConfigDocument = Config & Document;

export const ConfigSchema = SchemaFactory.createForClass(Config);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'categories',
  timestamps: true,
})
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  isActive: boolean;
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);

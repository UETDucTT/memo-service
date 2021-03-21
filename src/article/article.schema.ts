import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'articles',
  timestamps: true,
})
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  web: string;

  @Prop({ required: true })
  website: string;

  @Prop({ required: true })
  publishDate: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: string;
}

export type ArticleDocument = Article & Document;

export const ArticleSchema = SchemaFactory.createForClass(Article);

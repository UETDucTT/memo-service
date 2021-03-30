import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'articles',
  timestamps: true,
})
export class Article {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: false })
  web: string;

  @Prop({ required: false })
  website: string;

  @Prop({ required: false })
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

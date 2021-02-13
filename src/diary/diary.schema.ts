import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: false,
})
export class Resource {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  name: string;
}

const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ResourceSchema.set('toJSON', {
  virtuals: true,
});

@Schema({
  timestamps: false,
})
export class Link {
  @Prop({ required: true })
  url: string;

  @Prop()
  image: string;

  @Prop()
  title: string;

  @Prop()
  description: string;
}

const LinkSchema = SchemaFactory.createForClass(Link);

LinkSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

LinkSchema.set('toJSON', {
  virtuals: true,
});

@Schema({
  collection: 'records',
  timestamps: true,
})
export class Diary {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: string[];

  @Prop({ required: false, default: 'private' })
  status: string;

  @Prop({ required: true })
  time: Date;

  @Prop({ type: [{ type: ResourceSchema }] })
  resources: Resource[];

  @Prop({ type: [{ type: LinkSchema }] })
  links: Link[];
}

export type DiaryDocument = Diary & Document;

export const DiarySchema = SchemaFactory.createForClass(Diary);

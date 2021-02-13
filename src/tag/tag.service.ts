import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateTagDto, EditTagDto } from './tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag as TagMongo, TagDocument } from './tag.schema';

export type CreateTagDtoWithUser = CreateTagDto & {
  user: string;
};

@Injectable()
export class TagService {
  constructor(
    @InjectModel(TagMongo.name)
    private tagModel: Model<TagDocument>,
  ) {}

  getTag(condition: any) {
    return this.tagModel.findOne(condition);
  }

  getAllTags(user: any) {
    return this.tagModel.find({ user: user.id }).sort('-isDefault');
  }

  async getById(id: string, userId: string) {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }

  async update(id: string, _userId: string, params: EditTagDto) {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    const updatedTag = await this.tagModel.findByIdAndUpdate(id, params).exec();
    return updatedTag.id;
  }

  async deleteById(id: string, userId: string): Promise<string> {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    await tag.remove();
    return id;
  }

  async create(params: CreateTagDtoWithUser) {
    const newTagObj = new this.tagModel(params);
    return await newTagObj.save();
  }
}

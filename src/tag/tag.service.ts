import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/auth.entity';
import { CreateTagDto, EditTagDto } from './tag.dto';

type CreateTagDtoWithUser = CreateTagDto & {
  user: User;
};

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  getTag(condition: any) {
    return this.tagRepo.findOne({ where: condition });
  }

  getAllTags(user: User) {
    return this.tagRepo.find({
      where: { user: { id: user.id } },
      order: { isDefault: 'DESC' },
    });
  }

  async getById(id: string, userId: number) {
    const tag = await this.tagRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }

  async update(id: string, userId: string, params: EditTagDto) {
    const tag = await this.tagRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    this.tagRepo.merge(tag, params);
    await this.tagRepo.save(tag);
    return tag.id;
  }

  async deleteById(id: string, userId: string): Promise<string> {
    const tag = await this.tagRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    await this.tagRepo.remove(tag);
    return id;
  }

  async create(params: CreateTagDtoWithUser) {
    return await this.tagRepo.save(params);
  }
}

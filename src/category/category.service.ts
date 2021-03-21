import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto, EditCategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  getAllCategories() {
    return this.categoryModel.find().sort('-createdAt');
  }

  async create(params: any) {
    const newCategoryObj = new this.categoryModel(params);
    return await newCategoryObj.save();
  }

  async bulkCreate(categories: CreateCategoryDto['categories']) {
    return await this.categoryModel.insertMany(categories);
  }

  async update(id: string, params: EditCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`category with id ${id} not found`);
    }
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, params)
      .exec();
    return updatedCategory.id;
  }

  async deleteById(id: string): Promise<string> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`category with id ${id} not found`);
    }
    await category.remove();
    return id;
  }

  find(condition: any) {
    return this.categoryModel.findOne(condition);
  }
}

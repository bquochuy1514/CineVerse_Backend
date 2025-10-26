import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { slugify } from 'src/common/utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async handleCreateCategory(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException('Tên danh mục đã tồn tại');
    }

    // Tạo slug từ name
    const slug = slugify(createCategoryDto.name);

    // Tạo entity mới
    const category = this.categoriesRepository.create({
      slug,
      ...createCategoryDto,
    });

    // Lưu vô DB
    return await this.categoriesRepository.save(category);
  }

  async handleFindAllCategories() {
    return await this.categoriesRepository.find();
  }

  async handleGetCategoryById(id: number) {
    return await this.categoriesRepository.findOne({ where: { id } });
  }

  async handleUpdateCategoryById(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    // Tìm category
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    // Nếu update name, kiểm tra trùng tên + tạo slug
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Tên danh mục đã tồn tại');
      }
      category.slug = slugify(updateCategoryDto.name);
      category.name = updateCategoryDto.name;
    }

    // Cập nhật các field còn lại
    if (updateCategoryDto.description) {
      category.description = updateCategoryDto.description;
    }
    if (updateCategoryDto.is_active) {
      category.is_active = updateCategoryDto.is_active;
    }

    // Lưu lại DB
    return await this.categoriesRepository.save(category);
  }

  async handleRemoveCategoryById(id: number) {
    // Tìm category
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Xóa category
    await this.categoriesRepository.remove(category);

    return {
      message: 'Xoá danh mục thành công',
    };
  }
}

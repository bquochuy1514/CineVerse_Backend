/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { SerializedUser } from '../users/types';
import * as path from 'path';
import * as fs from 'fs';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async handleCreateProduct(
    user: any,
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    // trả user typeorm thông qua hàm handleGetUserProfile
    const userDB = await this.usersService.handleGetUserProfile(user);
    if (!userDB) throw new UnauthorizedException('User Not Found');

    // Lấy category nếu có
    let category = null;
    if (createProductDto.category_id) {
      category = await this.categoriesService.handleGetCategoryById(
        createProductDto.category_id,
      );
      if (!category) {
        throw new BadRequestException('Category không tồn tại');
      }
    }

    const imageUrls: string[] =
      files?.map(
        (file) => `${process.env.APP_URL}/images/products/${file.filename}`,
      ) || [];

    const product = this.productsRepository.create({
      ...createProductDto,
      image_urls: JSON.stringify(imageUrls),
      user: userDB,
      category,
    });

    const savedProduct = await this.productsRepository.save(product);

    return {
      message: 'Tạo sản phẩm thành công',
      product: {
        ...savedProduct,
        user: new SerializedUser(userDB),
        category,
      },
    };
  }

  async handleFindAllProducts() {
    const products = await this.productsRepository.find({
      relations: ['user', 'category'],
      order: { created_at: 'DESC' },
    });

    // map user sang SerializedUser
    return products.map((product) => ({
      ...product,
      user: new SerializedUser(product.user),
    }));
  }

  async handleGetProductById(id: number) {
    const productDB = await this.productsRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!productDB) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return {
      ...productDB,
      user: new SerializedUser(productDB.user),
    };
  }

  async handleUpdateProduct(
    id: number,
    user: any,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const userDB = await this.usersService.findUserByEmail(user.email);
    const productDB = await this.productsRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!productDB) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (userDB.id !== productDB.user.id && userDB.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');
    }

    // Parse mảng ảnh hiện tại
    // eslint-disable-next-line prefer-const
    let oldImages: string[] = productDB.image_urls
      ? JSON.parse(productDB.image_urls)
      : [];

    // Parse danh sách ảnh muốn giữ lại
    let keepImages: string[] = [];
    if (updateProductDto['keepImages']) {
      keepImages = JSON.parse(updateProductDto['keepImages']);
    }

    // Tìm ảnh nào cần xóa (có trong oldImages nhưng không nằm trong keepImages)
    const deleteImages = oldImages.filter((img) => !keepImages.includes(img));

    // Xóa ảnh bị loại khỏi file system
    await Promise.all(
      deleteImages.map((url) => {
        const filePath = path.join(
          __dirname,
          '../../../public/images/products',
          path.basename(url),
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }),
    );

    // Thêm ảnh mới (nếu có)
    const newImages =
      files?.map(
        (file) => `${process.env.APP_URL}/images/products/${file.filename}`,
      ) || [];

    // Tổng hợp danh sách ảnh cuối cùng
    const finalImages = [...keepImages, ...newImages];

    // Update dữ liệu
    await this.productsRepository.update(
      { id },
      { ...updateProductDto, image_urls: JSON.stringify(finalImages) },
    );

    // Lấy lại sản phẩm sau khi update
    const updatedProduct = await this.productsRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    return {
      message: 'Cập nhật sản phẩm thành công',
      product: {
        ...updatedProduct,
        user: new SerializedUser(updatedProduct.user),
      },
    };
  }

  async handleDeleteProductById(id: number, user: any) {
    const userDB = await this.usersService.findUserByEmail(user.email);
    const productDB = await this.productsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!productDB) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (userDB.id !== productDB.user.id && userDB.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền xoá sản phẩm này');
    }

    const currentImagesUrls: string[] = JSON.parse(
      productDB.image_urls || '[]',
    );

    // Xóa ảnh khỏi file system
    await Promise.all(
      currentImagesUrls.map((url) => {
        const filePath = path.join(
          __dirname,
          '../../../public/images/products',
          path.basename(url),
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }),
    );

    // Delete dữ liệu
    await this.productsRepository.delete(id);

    return {
      message: 'Xoá sản phẩm thành công',
    };
  }
}

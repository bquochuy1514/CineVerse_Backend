import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadProductImages } from './interceptors/upload-product-images.interceptor';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UploadProductImages())
  create(
    @Req() req,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.handleCreateProduct(
      req.user,
      createProductDto,
      files,
    );
  }

  @Get()
  findAll() {
    return this.productsService.handleFindAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: number) {
    return this.productsService.handleGetProductById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UploadProductImages())
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.handleUpdateProduct(
      id,
      req.user,
      updateProductDto,
      files,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

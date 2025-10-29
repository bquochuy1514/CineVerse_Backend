import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadCategoryIcon } from './interceptors/upload-category-icon.interceptor';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Lưu ý phải để JWT Auth Guard gần hơn với handler để nó lấy thông tin req.user trước để chạy vào rolesguard
  @Post()
  @UseInterceptors(UploadCategoryIcon())
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    return this.categoriesService.handleCreateCategory(createCategoryDto, icon);
  }

  @Get()
  findAllCategories() {
    return this.categoriesService.handleFindAllCategories();
  }

  @Get(':id')
  getCategoryById(@Param('id') id: number) {
    return this.categoriesService.handleGetCategoryById(id);
  }

  @Put(':id')
  @UseInterceptors(UploadCategoryIcon())
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  updateCategoryById(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    return this.categoriesService.handleUpdateCategoryById(
      id,
      updateCategoryDto,
      icon,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  removeCategoryById(@Param('id') id: number) {
    return this.categoriesService.handleRemoveCategoryById(id);
  }
}

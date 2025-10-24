import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { ProductCondition } from '../enums/product.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsString()
  image_urls?: string; // có thể là JSON.stringify([...])

  @IsOptional()
  @IsBoolean()
  is_sold?: boolean;

  @IsOptional()
  @IsBoolean()
  is_premium?: boolean;
}

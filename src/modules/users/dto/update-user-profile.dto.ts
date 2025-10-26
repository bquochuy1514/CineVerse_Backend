import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại phải là số Việt Nam hợp lệ' })
  phone?: string;
}

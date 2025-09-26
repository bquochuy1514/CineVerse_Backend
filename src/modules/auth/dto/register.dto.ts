import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email phải có định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
  })
  password: string;

  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @Match('password', { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword: string;

  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone: string;
}

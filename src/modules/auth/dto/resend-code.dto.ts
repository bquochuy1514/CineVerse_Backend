import { IsEmail } from 'class-validator';

export class ResendCodeDto {
  @IsEmail({}, { message: 'Email phải có định dạng hợp lệ' })
  email: string;
}

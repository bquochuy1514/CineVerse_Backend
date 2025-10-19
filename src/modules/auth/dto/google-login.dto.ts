import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  password: string;
}

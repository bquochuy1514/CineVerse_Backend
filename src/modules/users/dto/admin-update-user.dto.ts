import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../enums/user.enum';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Vai trò phải là một trong các giá trị: customer, admin, premium',
  })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  // @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

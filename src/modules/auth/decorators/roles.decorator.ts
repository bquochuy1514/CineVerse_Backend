import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/users/enums/user.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: [UserRole, ...UserRole[]]) =>
  SetMetadata(ROLES_KEY, roles);

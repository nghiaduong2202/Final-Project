import { SetMetadata } from '@nestjs/common';
import { AuthRoleEnum } from '../enums/auth-role.enum';

export const AuthRoles = (...roles: AuthRoleEnum[]) =>
  SetMetadata('auth-roles', roles);

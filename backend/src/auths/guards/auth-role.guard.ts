import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRoleEnum } from '../enums/auth-role.enum';
import { AdminGuard } from './admin.guard';
import { OwnerGuard } from './owner.guard';
import { PlayerGuard } from './player.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  private static readonly defaultRole = AuthRoleEnum.ADMIN;

  private get roleGuardMap(): Record<AuthRoleEnum, CanActivate> {
    return {
      [AuthRoleEnum.NONE]: { canActivate: () => true },
      [AuthRoleEnum.ADMIN]: this.adminGuard,
      [AuthRoleEnum.OWNER]: this.ownerGuard,
      [AuthRoleEnum.PLAYER]: this.playerGuard,
    };
  }

  constructor(
    /**
     * Inject AdminGuard
     */
    private readonly adminGuard: AdminGuard,
    /**
     * Inject OwnerGuard
     */
    private readonly ownerGuard: OwnerGuard,
    /**
     * Inject PlayerGuard
     */
    private readonly playerGuard: PlayerGuard,
    /**
     * Inject Reflector
     */
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<AuthRoleEnum[]>(
      'auth-roles',
      [context.getHandler(), context.getClass()],
    ) || [AuthRoleGuard.defaultRole];

    const guards = roles.map((authRole) => this.roleGuardMap[authRole]).flat();

    for (const instance of guards) {
      const canActivate = await instance.canActivate(context);

      if (canActivate) {
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}

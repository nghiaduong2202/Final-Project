import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ActivePersonData } from '../interfaces/active-person-data.interface';
import { AuthRoleEnum } from '../enums/auth-role.enum';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    /**
     * Inject JwtService
     */
    private readonly jwtService: JwtService,
    /**
     * Inject ConfigService
     */
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractRequestFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync<ActivePersonData>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      if (payload.role !== String(AuthRoleEnum.OWNER)) {
        return false;
      }

      request['person'] = payload;
    } catch {
      return false;
    }
    return true;
  }

  private extractRequestFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') || [];

    return token;
  }
}

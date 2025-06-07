import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UUID } from 'crypto';

@Injectable()
export class TokenProvider {
  constructor(
    /**
     * inject jwtService
     */
    private readonly jwtService: JwtService,
  ) {}

  public async generate<T>(
    personId: UUID,
    secret: string,
    expiresIn: string,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: personId,
        ...payload,
      },
      {
        secret,
        expiresIn,
      },
    );
  }

  public async verify<T extends object>(token: string, secret: string) {
    try {
      return await this.jwtService.verifyAsync<T>(token, {
        secret,
      });
    } catch (error) {
      throw new UnauthorizedException(String(error));
    }
  }
}

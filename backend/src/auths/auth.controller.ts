import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthRoles } from './decorators/auth-role.decorator';
import { AuthRoleEnum } from './enums/auth-role.enum';
import { LoginDto } from './dtos/requests/login.dto';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dtos/requests/register.dto';
import { RefreshTokenDto } from './dtos/requests/refresh-token.dto';

@Controller('auth')
@AuthRoles(AuthRoleEnum.NONE)
export class AuthController {
  constructor(
    /**
     * inject AuthService
     */
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'login account (role: none)',
  })
  @Post('/login')
  public login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'register account (role: none)',
  })
  @Post('/register')
  public register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'refresh token',
  })
  @Put('/refresh-token')
  public refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresheToken(refreshTokenDto);
  }
}

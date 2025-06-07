import { LoginResponseDto } from 'src/auths/dtos/responses/login-response.dto';
import { LoginDto } from 'src/auths/dtos/requests/login.dto';
import { MessageReponseDto } from 'src/auths/dtos/responses/message-response.dto';
import { RefreshTokenDto } from 'src/auths/dtos/requests/refresh-token.dto';
import { RegisterDto } from 'src/auths/dtos/requests/register.dto';
import { RefreshTokenReponseDto } from 'src/auths/dtos/responses/refresh-token-response.dto';
import { ActivePersonData } from './interfaces/active-person-data.interface';

export interface IAuthService {
  login(loginDto: LoginDto): Promise<LoginResponseDto>;

  register(registerDto: RegisterDto): Promise<MessageReponseDto>;

  refresheToken(refreshToken: RefreshTokenDto): Promise<RefreshTokenReponseDto>;

  verifyAccessToken(token: string): Promise<ActivePersonData>;
}

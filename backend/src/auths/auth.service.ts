import { PersonService } from 'src/people/person.service';
import { LoginDto } from './dtos/requests/login.dto';
import { RefreshTokenDto } from './dtos/requests/refresh-token.dto';
import { RegisterDto } from './dtos/requests/register.dto';
import { LoginResponseDto } from './dtos/responses/login-response.dto';
import { MessageReponseDto } from './dtos/responses/message-response.dto';
import { RefreshTokenReponseDto } from './dtos/responses/refresh-token-response.dto';
import { IAuthService } from './iauth.service';
import { HashProvider } from './providers/hash.provider';
import { ConfigService } from '@nestjs/config';
import { TokenProvider } from './providers/token.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ActivePersonData } from './interfaces/active-person-data.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
    /**
     * inject HasProvider
     */
    private readonly hashProvider: HashProvider,
    /**
     * inject ConfigService
     */
    private readonly configService: ConfigService,
    /**
     * injcet TokenProvider
     */
    private readonly tokenProvider: TokenProvider,
  ) {}

  public async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const person = await this.personService.findOneByEmail(loginDto.email);

    // check password
    const isEqual = await this.hashProvider.comparePassword(
      loginDto.password,
      person.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Wrong email or password');
    }

    // generta access token
    const payload = {
      role: person.role,
    };

    const accessToken = await this.tokenProvider.generate(
      person.id,
      this.configService.get<string>('JWT_SECRET')!,
      this.configService.get<string>('JWT_EXPIRE')!,
      payload,
    );

    // generate refresh token
    const refreshToken = await this.tokenProvider.generate(
      person.id,
      this.configService.get<string>('JWT_SECRET_REFRESH')!,
      this.configService.get<string>('JWT_EXPIRE_REFRESH')!,
    );

    // store access token and refresh token into session cookie
    // implement later, after discuss with team

    return {
      accessToken,
      refreshToken,
    };
  }

  public async register(registerDto: RegisterDto): Promise<MessageReponseDto> {
    // hash password
    const hashPassword = await this.hashProvider.hashPassword(
      registerDto.password,
    );
    // set hashpassword to password
    registerDto.password = hashPassword;

    // create new person
    await this.personService.createOne(registerDto);

    return {
      message: 'Create successfull',
    };
  }

  public async refresheToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenReponseDto> {
    // verify refresh token
    const { sub } = await this.tokenProvider.verify<
      Pick<ActivePersonData, 'sub'>
    >(
      refreshTokenDto.refreshToken,
      this.configService.get<string>('JWT_SECRET_REFRESH')!,
    );

    // get person if from refresh token
    const person = await this.personService.findOneById(sub);

    // generate new access token
    const payload = { role: person.role };

    const accessToken = await this.tokenProvider.generate(
      sub,
      this.configService.get<string>('JWT_SECRET')!,
      this.configService.get<string>('JWT_EXPIRE')!,
      payload,
    );

    // maybe implement function save ti to session, later

    return {
      accessToken,
    };
  }

  public async verifyAccessToken(token: string): Promise<ActivePersonData> {
    return this.tokenProvider.verify(
      token,
      this.configService.get<string>('JWT_SECRET')!,
    );
  }
}

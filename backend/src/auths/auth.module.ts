import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { HashProvider } from './providers/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { PersonModule } from 'src/people/person.module';
import { TokenProvider } from './providers/token.provider';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE'),
          issuer: configService.get<string>('JWT_TOKEN_ISSUER'),
          audience: configService.get<string>('JWT_TOKEN_AUDIENCE'),
        },
      }),
    }),
    PersonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
    TokenProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}

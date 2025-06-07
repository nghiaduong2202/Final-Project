import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonModule } from './people/person.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auths/auth.module';
import { AuthRoleGuard } from './auths/guards/auth-role.guard';
import { APP_GUARD } from '@nestjs/core';
import { AdminGuard } from './auths/guards/admin.guard';
import { PlayerGuard } from './auths/guards/player.guard';
import { OwnerGuard } from './auths/guards/owner.guard';
import { JwtModule } from '@nestjs/jwt';
import { CloudUploaderModule } from './cloud-uploader/cloud-uploader.module';
import { SportModule } from './sports/sport.module';
import { FieldModule } from './fields/field.module';
import { FieldGroupModule } from './field-groups/field-group.module';
import { FacilityModule } from './facilities/facility.module';
import { CertificateModule } from './certificates/certificate.module';
import { LicenseModule } from './licenses/license.module';
import { ServiceModule } from './services/service.module';
import { VoucherModule } from './vouchers/voucher.module';
import { ApprovalModule } from './approvals/approval.module';
import { BookingModule } from './bookings/booking.module';
import { BookingSlotModule } from './booking-slots/booking-slot.module';
import { AdditionalServiceModule } from './additional-services/additional-service.module';
import { PaymentModule } from './payments/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewModule } from './reviews/review.module';
import { FavortiteFacilityModule } from './favorite-facilities/favortite-facility.module';
import { SearchModule } from './search/search.module';
import { ChatModule } from './chats/chat.module';
import { PlaymateModule } from './playmates/playmate.module';
import { EventModule } from './events/event.module';

@Module({
  imports: [
    PersonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: configService.get<boolean>('DATABASE_AUTOLOAD'),
        synchronize: configService.get<boolean>('DATABASE_SYNC'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        host: configService.get<string>('DATABASE_HOST'),
        database: configService.get<string>('DATABASE_NAME'),
        logging: [
          'error',
          'warn',
          'schema',
          'query',
          'info',
          'log',
          'migration',
        ],
      }),
    }),
    AuthModule,
    JwtModule,
    CloudUploaderModule,
    SportModule,
    FieldModule,
    FieldGroupModule,
    FacilityModule,
    CertificateModule,
    LicenseModule,
    ServiceModule,
    VoucherModule,
    ApprovalModule,
    BookingModule,
    BookingSlotModule,
    AdditionalServiceModule,
    PaymentModule,
    ScheduleModule.forRoot(),
    ReviewModule,
    FavortiteFacilityModule,
    SearchModule,
    ChatModule,
    PlaymateModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthRoleGuard,
    },
    AdminGuard,
    PlayerGuard,
    OwnerGuard,
  ],
})
export class AppModule {}

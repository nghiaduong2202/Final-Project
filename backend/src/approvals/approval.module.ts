import { forwardRef, Module } from '@nestjs/common';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approval } from './approval.entity';
import { ApprovalFacilityProvider } from './providers/approval-facility.provider';
import { ApprovalFacilityNameProvider } from './providers/approval-facility-name.provider';
import { ApprovalCertificateProvider } from './providers/approval-certificate.provider';
import { ApprovalLicenseProvider } from './providers/approval-license.provider';
import { FacilityModule } from 'src/facilities/facility.module';
import { SportModule } from 'src/sports/sport.module';
import { LicenseModule } from 'src/licenses/license.module';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Approval]),
    forwardRef(() => FacilityModule),
    SportModule,
    LicenseModule,
    SearchModule,
  ],
  controllers: [ApprovalController],
  providers: [
    ApprovalService,
    ApprovalFacilityProvider,
    ApprovalFacilityNameProvider,
    ApprovalCertificateProvider,
    ApprovalLicenseProvider,
  ],
  exports: [ApprovalService],
})
export class ApprovalModule {}

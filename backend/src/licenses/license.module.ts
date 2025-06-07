import { forwardRef, Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { FacilityModule } from 'src/facilities/facility.module';
import { CloudUploaderModule } from 'src/cloud-uploader/cloud-uploader.module';
import { SportModule } from 'src/sports/sport.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './license.entity';

@Module({
  imports: [
    forwardRef(() => FacilityModule),
    CloudUploaderModule,
    SportModule,
    TypeOrmModule.forFeature([License]),
  ],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService],
})
export class LicenseModule {}

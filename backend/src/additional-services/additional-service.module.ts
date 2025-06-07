import { Module } from '@nestjs/common';
import { AdditionalServiceService } from './additional-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalService } from './additional-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalService])],
  providers: [AdditionalServiceService],
  exports: [AdditionalServiceService],
})
export class AdditionalServiceModule {}

import { Module } from '@nestjs/common';
import { FavoriteFacilityService } from './favorite-facility.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavortiteFacility } from './favorite-facility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavortiteFacility])],
  providers: [FavoriteFacilityService],
  exports: [FavoriteFacilityService],
})
export class FavortiteFacilityModule {}

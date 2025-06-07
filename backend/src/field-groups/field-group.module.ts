import { forwardRef, Module } from '@nestjs/common';
import { FieldGroupService } from './field-group.service';
import { FieldGroupController } from './field-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldGroup } from './field-group.entity';
import { FieldModule } from 'src/fields/field.module';
import { FacilityModule } from 'src/facilities/facility.module';
import { SportModule } from 'src/sports/sport.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldGroup]),
    forwardRef(() => FieldModule),
    forwardRef(() => FacilityModule),
    SportModule,
  ],
  providers: [FieldGroupService],
  controllers: [FieldGroupController],
  exports: [FieldGroupService],
})
export class FieldGroupModule {}

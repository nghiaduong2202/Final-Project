import { forwardRef, Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { FieldController } from './field.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './field.entity';
import { FieldGroupModule } from 'src/field-groups/field-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Field]),
    forwardRef(() => FieldGroupModule),
  ],
  providers: [FieldService],
  controllers: [FieldController],
  exports: [FieldService],
})
export class FieldModule {}

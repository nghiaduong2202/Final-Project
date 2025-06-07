import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './person.entity';
import { CloudUploaderModule } from 'src/cloud-uploader/cloud-uploader.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), CloudUploaderModule],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}

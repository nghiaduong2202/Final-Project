import { Module } from '@nestjs/common';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './sport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sport])],
  controllers: [SportController],
  providers: [SportService],
  exports: [SportService],
})
export class SportModule {}

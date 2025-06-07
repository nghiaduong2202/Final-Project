import { Module, forwardRef } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';
import { FacilityModule } from 'src/facilities/facility.module';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        auth: {
          username: configService.get<string>('ELASTICSEARCH_USERNAME') || 'elastic',
          password: configService.get<string>('ELASTICSEARCH_PASSWORD') || 'changeme',
        },
        tls: {
          rejectUnauthorized: false,
        },
        maxRetries: 10,
        requestTimeout: 60000,
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => FacilityModule),
  ],
  controllers: [SearchController],
  providers: [SearchService, ElasticsearchService],
  exports: [SearchService, ElasticsearchService],
})
export class SearchModule {}

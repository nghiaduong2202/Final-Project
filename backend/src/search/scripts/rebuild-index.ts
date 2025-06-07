import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { ElasticsearchService } from '../elasticsearch.service';
import { SearchService } from '../search.service';

async function bootstrap() {
  const logger = new Logger('RebuildIndexScript');
  logger.log('Starting Elasticsearch index rebuild script...');
  
  try {
    // Create a standalone NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the required services
    const elasticsearchService = app.get(ElasticsearchService);
    const searchService = app.get(SearchService);
    
    // Reset the index (delete and recreate with new mappings)
    logger.log('Resetting Elasticsearch index...');
    const resetResult = await elasticsearchService.resetIndex();
    logger.log(`Index reset result: ${resetResult.message}`);
    
    // Sync all facilities to the new index
    logger.log('Syncing all facilities to Elasticsearch...');
    const syncResult = await searchService.syncAllFacilitiesToElasticsearch();
    logger.log(`Sync result: ${syncResult.message}`);
    
    logger.log('Index rebuild completed successfully');
    
    // Close the application context
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error rebuilding index:', error instanceof Error ? error.stack : 'Unknown error');
    process.exit(1);
  }
}

bootstrap(); 
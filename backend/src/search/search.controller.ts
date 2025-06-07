import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dtos/search-query.dto';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { FacilityService } from 'src/facilities/facility.service';
import { Logger } from '@nestjs/common';
import { SearchSuggestionDto } from './dtos/search-suggestion.dto';
import { ElasticsearchService } from './elasticsearch.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly facilityService: FacilityService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @ApiOperation({
    summary: 'Search facilities with optional filters and sort',
    description: 'Returns facilities matching the search criteria including sports, location, and rating filters'
  })
  @ApiResponse({
    status: 200,
    description: 'List of facilities matching the search criteria',
  })
  @Get('facilities')
  @AuthRoles(AuthRoleEnum.NONE)
  async searchFacilities(@Query() searchQueryDto: SearchQueryDto) {
    return this.searchService.searchFacilities(searchQueryDto);
  }

  @ApiOperation({
    summary: 'Get search suggestions as you type',
    description: 'Returns autocomplete suggestions for facility names and locations based on the prefix'
  })
  @ApiResponse({
    status: 200,
    description: 'List of search suggestions',
  })
  @Get('suggestions')
  @AuthRoles(AuthRoleEnum.NONE)
  async getSuggestions(@Query() suggestionDto: SearchSuggestionDto) {
    return this.searchService.getSuggestions(suggestionDto);
  }

  @ApiOperation({
    summary: 'Check Elasticsearch mapping',
    description: 'Returns the current Elasticsearch mapping for debugging'
  })
  @ApiResponse({
    status: 200,
    description: 'Current Elasticsearch mapping',
  })
  @Get('check-mapping')
  @AuthRoles(AuthRoleEnum.NONE)
  async checkMapping() {
    return this.elasticsearchService.checkMapping(
      this.elasticsearchService.getFacilitiesIndex()
    );
  }

  @ApiOperation({
    summary: 'Get detailed facility information by ID',
    description: 'Returns complete facility details with all related information'
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed facility information',
  })
  @ApiResponse({
    status: 404,
    description: 'Facility not found',
  })
  @Get('facility/:id')
  @AuthRoles(AuthRoleEnum.NONE)
  async getFacilityById(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.facilityService.getByFacility(id);
  }

  @ApiOperation({
    summary: 'Count documents in Elasticsearch',
    description: 'Returns the number of documents in the Elasticsearch index'
  })
  @ApiResponse({
    status: 200,
    description: 'Document count',
  })
  @Get('count')
  @AuthRoles(AuthRoleEnum.NONE)
  async countDocuments() {
    return this.elasticsearchService.countDocuments(
      this.elasticsearchService.getFacilitiesIndex()
    );
  }

  @ApiOperation({
    summary: 'Test search for debugging',
    description: 'Search facilities with a simple query for debugging'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  @Get('test-search')
  @AuthRoles(AuthRoleEnum.NONE)
  async testSearch(@Query('query') query: string = '') {
    const searchQuery = {
      body: {
        size: 10,
        _source: ["name", "location", "status"],
        query: {
          match_all: {}
        }
      }
    };
    
    this.logger.log(`Testing search with query: ${query}`);
    const response = await this.elasticsearchService.search(
      this.elasticsearchService.getFacilitiesIndex(),
      searchQuery
    );
    
    // Format the response for better readability
    const formattedResults = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      name: hit._source.name,
      location: hit._source.location,
      status: hit._source.status
    }));
    
    return {
      total: response.hits.total.value,
      results: formattedResults
    };
  }

  @ApiOperation({
    summary: 'Update Elasticsearch settings for Vietnamese language',
    description: 'Updates mappings and analyzers to support Vietnamese accent-less search'
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
  })
  @Get('update-vietnamese-support')
  @AuthRoles(AuthRoleEnum.NONE)
  async updateVietnameseSupport() {
    try {
      this.logger.log('Starting update of Elasticsearch settings for Vietnamese support');
      
      // 1. Xóa index hiện tại và tạo lại với cấu trúc hỗ trợ tiếng Việt
      const resetResult = await this.elasticsearchService.resetIndex();
      
      if (!resetResult.success) {
        return {
          success: false,
          message: 'Failed to reset Elasticsearch index',
          error: resetResult.message
        };
      }
      
      // 2. Đếm số lượng document hiện tại (nên là 0 sau khi reset)
      const initialCount = await this.elasticsearchService.countDocuments(
        this.elasticsearchService.getFacilitiesIndex()
      );
      
      // 3. Đồng bộ lại tất cả facility vào Elasticsearch 
      await this.searchService.syncAllFacilitiesToElasticsearch();
      
      // 4. Kiểm tra lại số lượng document sau khi đồng bộ
      const finalCount = await this.elasticsearchService.countDocuments(
        this.elasticsearchService.getFacilitiesIndex()
      );
      
      return {
        success: true,
        message: 'Successfully updated Elasticsearch to support Vietnamese',
        initialCount: initialCount?.count || 0,
        finalCount: finalCount?.count || 0
      };
    } catch (error) {
      this.logger.error('Failed to update Elasticsearch settings', error);
      return {
        success: false,
        message: 'Failed to update Elasticsearch settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  @ApiOperation({
    summary: 'Test Vietnamese search with/without accents',
    description: 'Test if searching without accents works properly'
  })
  @ApiResponse({
    status: 200,
    description: 'Test results',
  })
  @Get('test-vietnamese')
  @AuthRoles(AuthRoleEnum.NONE)
  async testVietnameseSearch(
    @Query('with_accent') withAccent: string,
    @Query('without_accent') withoutAccent: string
  ) {
    try {
      this.logger.log(`Testing Vietnamese search with: "${withAccent}" and "${withoutAccent}"`);
      
      // Tìm kiếm với từ có dấu
      const resultsWithAccent = await this.searchService.searchFacilities({
        query: withAccent,
        limit: 5
      });
      
      // Tìm kiếm với từ không dấu
      const resultsWithoutAccent = await this.searchService.searchFacilities({
        query: withoutAccent,
        limit: 5
      });
      
      // Phân tích kết quả để so sánh
      const withAccentIds = resultsWithAccent.map(item => item.id);
      const withoutAccentIds = resultsWithoutAccent.map(item => item.id);
      
      // Kiểm tra số kết quả giống nhau
      const commonResults = withAccentIds.filter(id => withoutAccentIds.includes(id));
      
      return {
        success: true,
        withAccent: {
          query: withAccent,
          count: resultsWithAccent.length,
          results: resultsWithAccent.map(item => ({
            id: item.id,
            name: item.name,
            location: item.location
          }))
        },
        withoutAccent: {
          query: withoutAccent,
          count: resultsWithoutAccent.length,
          results: resultsWithoutAccent.map(item => ({
            id: item.id,
            name: item.name,
            location: item.location
          }))
        },
        comparison: {
          commonCount: commonResults.length,
          isEquivalent: commonResults.length > 0,
          similarity: commonResults.length / Math.max(withAccentIds.length, withoutAccentIds.length, 1)
        }
      };
    } catch (error) {
      this.logger.error('Error testing Vietnamese search', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @ApiOperation({
    summary: 'Reset and sync Elasticsearch index with improved search settings',
    description: 'Resets the Elasticsearch index and resyncs all data with improved search settings'
  })
  @ApiResponse({
    status: 200,
    description: 'Reset and sync status',
  })
  @Get('reset-and-sync')
  @AuthRoles(AuthRoleEnum.NONE)
  async resetAndSync() {
    try {
      this.logger.log('Starting reset and sync of Elasticsearch index');
      
      // 1. Reset the index with updated settings
      const resetResult = await this.elasticsearchService.resetIndex();
      
      if (!resetResult.success) {
        return {
          success: false,
          message: 'Failed to reset Elasticsearch index',
          error: resetResult.message
        };
      }
      
      // 2. Sync all facilities to the new index
      const syncResult = await this.searchService.syncAllFacilitiesToElasticsearch();
      
      return {
        success: true,
        message: 'Successfully reset and synced Elasticsearch index with improved search settings',
        resetResult,
        syncResult
      };
    } catch (error) {
      this.logger.error('Failed to reset and sync Elasticsearch index', error);
      return {
        success: false,
        message: 'Failed to reset and sync Elasticsearch index',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @ApiOperation({
    summary: 'Test analyzer to see how text is tokenized',
    description: 'Shows how the analyzer breaks down text into tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'Analysis result',
  })
  @Get('test-analyzer')
  @AuthRoles(AuthRoleEnum.NONE)
  async testAnalyzer(@Query('text') text: string, @Query('analyzer') analyzer?: string) {
    if (!text) {
      return {
        success: false,
        error: 'Text parameter is required'
      };
    }
    
    return this.elasticsearchService.testAnalyzer(text, analyzer);
  }
}

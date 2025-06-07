import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { FacilityStatusEnum } from '../facilities/enums/facility-status.enum';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly indices = {
    facilities: 'facilities',
  };

  constructor(
    private readonly elasticsearchService: NestElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.checkIndices();
    } catch (error: any) {
      this.logger.error('Elasticsearch initialization error', error?.stack);
    }
  }

  private async checkIndices() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indices.facilities,
      });

      // Create index if it doesn't exist
      if (!indexExists) {
        await this.createFacilitiesIndex();
        this.logger.log(
          `Index ${this.indices.facilities} created successfully`,
        );
      } else {
        // Index exists but we might need to update it
        this.logger.log(
          `Index ${this.indices.facilities} already exists, skipping creation`,
        );
        
        // Check if we need to update mappings
        try {
          // For development purposes, you might want to update the existing index
          // In production, consider using index aliases and create a new index instead
          await this.updateFacilitiesIndexMapping();
        } catch (updateError) {
          this.logger.warn(
            `Could not update index mapping: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error checking indices: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      // We'll log the error but not throw, allowing the application to continue
      // even if Elasticsearch is not available
    }
  }

  private async createFacilitiesIndex() {
    try {
      // Check if index already exists
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indices.facilities,
      });

      // If index already exists, we might need to close it before updating settings
      if (indexExists) {
        // Try to delete the index and recreate it (in development environments)
        // In production, you might want to use aliases and create a new index instead
        try {
          await this.elasticsearchService.indices.delete({
            index: this.indices.facilities,
          });
          this.logger.log(`Deleted existing index ${this.indices.facilities}`);
        } catch (deleteError) {
          this.logger.error(
            `Could not delete existing index: ${deleteError.message}`,
            deleteError.stack,
          );
          
          // If we can't delete, try to close before updating settings
          try {
            await this.elasticsearchService.indices.close({
              index: this.indices.facilities,
            });
            this.logger.log(`Closed index ${this.indices.facilities} for updates`);
          } catch (closeError) {
            this.logger.error(
              `Could not close index: ${closeError.message}`,
              closeError.stack,
            );
            // If we can't close either, throw an error
            throw new Error(
              'Index exists but cannot be deleted or closed for updates',
            );
          }
        }
      }

      // Create index with settings and mappings in one operation
      await this.elasticsearchService.indices.create({
        index: this.indices.facilities,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                standard: {
                  type: 'standard',
                },
                vietnamese_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding', // Loại bỏ dấu tiếng Việt, giúp tìm kiếm không phân biệt dấu
                    'vietnamese_stop',
                    'vietnamese_synonym'
                  ]
                },
                vietnamese_search_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding',
                    'vietnamese_stop',
                    'vietnamese_synonym'
                  ]
                }
              },
              filter: {
                vietnamese_synonym: {
                  type: 'synonym',
                  synonyms: [
                    'san, sân',
                    'bong, bóng',
                    'tennis, ten nit',
                    'da, đá',
                    'the thao, thể thao',
                    'bong da, bóng đá',
                    'bong ro, bóng rổ',
                    'bong chuyen, bóng chuyền',
                    'cau long, cầu lông',
                    'boi, bơi',
                    'dien kinh, điền kinh'
                  ]
                },
                vietnamese_stop: {
                  type: 'stop',
                  stopwords: ['và', 'hoặc', 'của', 'cho', 'tại', 'trong', 'ngoài', 'với']
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  completion: {
                    type: 'completion',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  }
                }
              },
              description: { 
                type: 'text', 
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer'
              },
              location: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  completion: {
                    type: 'completion',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  }
                }
              },
              avgRating: { type: 'float' },
              numberOfRating: { type: 'integer' },
              status: { type: 'keyword' },
              imagesUrl: { type: 'keyword' },
              openTime1: { type: 'keyword' },
              closeTime1: { type: 'keyword' },
              openTime2: { type: 'keyword' },
              closeTime2: { type: 'keyword' },
              openTime3: { type: 'keyword' },
              closeTime3: { type: 'keyword' },
              numberOfShifts: { type: 'integer' },
              sports: {
                type: 'nested',
                properties: {
                  id: { type: 'integer' },
                  name: {
                    type: 'text',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer',
                    fields: {
                      keyword: { type: 'keyword' },
                    },
                  },
                },
              },
              fieldGroups: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  name: { 
                    type: 'text',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  },
                  basePrice: { type: 'float' },
                },
              },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            }
          }
        }
      });

      // If we closed the index earlier, reopen it
      if (indexExists) {
        try {
          await this.elasticsearchService.indices.open({
            index: this.indices.facilities,
          });
          this.logger.log(`Reopened index ${this.indices.facilities}`);
        } catch (openError) {
          this.logger.error(
            `Could not reopen index: ${openError.message}`,
            openError.stack,
          );
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error(
        `Error creating facilities index: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async indexFacility(facility: any): Promise<any> {
    try {
      if (!facility) {
        this.logger.error('Attempted to index undefined facility');
        return;
      }

      const document = this.mapFacilityToDocument(facility);

      return this.elasticsearchService.index({
        index: this.indices.facilities,
        id: facility.id,
        document,
        refresh: true,
      });
    } catch (error: any) {
      this.logger.error(
        `Error indexing facility: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private mapFacilityToDocument(facility: any) {
    // Basic facility properties
    const document: any = {
      id: facility.id,
      name: facility.name,
      description: facility.description || '',
      location: facility.location,
      avgRating: facility.avgRating || 0,
      numberOfRating: facility.numberOfRating || 0,
      status: facility.status || FacilityStatusEnum.PENDING,
      imagesUrl: facility.imagesUrl || [],
      openTime1: facility.openTime1,
      closeTime1: facility.closeTime1,
      openTime2: facility.openTime2 || null,
      closeTime2: facility.closeTime2 || null,
      openTime3: facility.openTime3 || null,
      closeTime3: facility.closeTime3 || null,
      numberOfShifts: facility.numberOfShifts || 1,
      createdAt: facility.createdAt,
      updatedAt: facility.updatedAt,
      // Include minPrice and maxPrice if they exist
      minPrice: facility.minPrice || 0,
      maxPrice: facility.maxPrice || 0
    };

    // Collect all sports from various sources
    let allSports: any[] = [];

    // Get sports from licenses
    if (
      facility.licenses &&
      Array.isArray(facility.licenses) &&
      facility.licenses.length > 0
    ) {
      const licenseSports = facility.licenses
        .map((license: any) => ({
          id: license.sport?.id,
          name: license.sport?.name,
        }))
        .filter((sport: any) => sport.id && sport.name);
      
      allSports = [...allSports, ...licenseSports];
    }

    // Get sports directly if available
    if (
      facility.sports &&
      Array.isArray(facility.sports) &&
      facility.sports.length > 0
    ) {
      allSports = [...allSports, ...facility.sports];
    }

    // Get sports from fieldGroups
    if (
      facility.fieldGroups &&
      Array.isArray(facility.fieldGroups) &&
      facility.fieldGroups.length > 0
    ) {
      const fieldGroupSports = facility.fieldGroups
        .filter((group: any) => 
          group.sports && 
          Array.isArray(group.sports) && 
          group.sports.length > 0
        )
        .flatMap((group: any) => group.sports);
      
      if (fieldGroupSports.length > 0) {
        allSports = [...allSports, ...fieldGroupSports];
      }
    }

    // Remove duplicate sports
    if (allSports.length > 0) {
      document.sports = allSports
        .filter(
          (sport, index, self) =>
            index === self.findIndex((s) => s.id === sport.id)
        )
        .map((sport) => ({
          id: sport.id,
          name: sport.name
        }));
    } else {
      document.sports = [];
    }

    // Add field groups information with basePrice for min/max calculation
    if (
      facility.fieldGroups &&
      Array.isArray(facility.fieldGroups) &&
      facility.fieldGroups.length > 0
    ) {
      document.fieldGroups = facility.fieldGroups.map((group: any) => ({
        id: group.id,
        name: group.name,
        basePrice: group.basePrice || 0,
      }));

      // Calculate minPrice and maxPrice if not already provided
      if (!facility.minPrice || !facility.maxPrice) {
        const prices = facility.fieldGroups
          .map((group: any) => group.basePrice || 0)
          .filter((price: number) => price > 0);

        if (prices.length > 0) {
          document.minPrice = Math.min(...prices);
          document.maxPrice = Math.max(...prices);
        }
      }
    }

    return document;
  }

  async search<T>(index: string, query: Record<string, any>): Promise<any> {
    try {
      return await this.elasticsearchService.search({
        index,
        ...query,
      });
    } catch (error: any) {
      this.logger.error(
        `Error searching in Elasticsearch: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async suggest(index: string, suggestionQuery: Record<string, any>): Promise<any> {
    try {
      this.logger.log(`Sending suggestion query to Elasticsearch: ${JSON.stringify(suggestionQuery)}`);
      
      // Thay đổi cách gọi API để đảm bảo body được gửi đúng cách
      const response = await this.elasticsearchService.search({
        index,
        body: suggestionQuery,
      });
      
      this.logger.log(`Raw Elasticsearch response: ${JSON.stringify(response)}`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error getting suggestions from Elasticsearch: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async update(index: string, id: string, body: any): Promise<any> {
    try {
      return await this.elasticsearchService.update({
        index,
        id,
        body: {
          doc: body,
        },
        refresh: true,
      });
    } catch (error: any) {
      this.logger.error(
        `Error updating document: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async delete(index: string, id: string): Promise<any> {
    try {
      return await this.elasticsearchService.delete({
        index,
        id,
        refresh: true,
      });
    } catch (error: any) {
      this.logger.error(
        `Error deleting document: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async bulkIndex(index: string, data: any[]): Promise<any> {
    if (!data || data.length === 0) {
      this.logger.warn('No data provided for bulk indexing');
      return;
    }

    try {
      this.logger.log(`Indexing ${data.length} documents to ${index}`);
      
      const body = data.flatMap((doc) => [
        { index: { _index: index, _id: doc.id } },
        this.mapFacilityToDocument(doc),
      ]);
      
      const result = await this.elasticsearchService.bulk({
        body,
        refresh: true,
      });
      
      this.logger.log(`Bulk indexing completed for ${body.length / 2} documents`);
      
      return result;
    } catch (error: any) {
      this.logger.error(
        `Error performing bulk indexing: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async refreshIndex(index: string): Promise<any> {
    try {
      return await this.elasticsearchService.indices.refresh({
        index,
      });
    } catch (error: any) {
      this.logger.error(
        `Error refreshing index: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  getFacilitiesIndex(): string {
    return this.indices.facilities;
  }

  /**
   * Count documents in an index
   */
  async countDocuments(index: string): Promise<any> {
    try {
      return await this.elasticsearchService.count({
        index,
      });
    } catch (error: any) {
      this.logger.error(
        `Error counting documents: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  // Add a new method to update mappings for an existing index
  private async updateFacilitiesIndexMapping() {
    try {
      // Thay vì cập nhật mapping đã tồn tại, tốt hơn là tạo index mới và reindex dữ liệu
      // Do không thể thay đổi mapping của một trường từ non-nested sang nested hoặc ngược lại
      this.logger.log(`Cannot update mapping directly, scheduling reindex process instead`);
      
      // Kiểm tra index có tồn tại không
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indices.facilities
      });
      
      if (indexExists) {
        try {
          // Sử dụng phương thức reindexData để tạo index mới với cấu trúc mới
          await this.reindexData();
          this.logger.log(`Successfully reindexed data with new Vietnamese mapping`);
          return true;
        } catch (reindexError) {
          this.logger.error(
            `Error reindexing data: ${reindexError instanceof Error ? reindexError.message : 'Unknown error'}`,
            reindexError instanceof Error ? reindexError.stack : undefined
          );
          
          // Nếu không thể reindex, tiến hành reset index
          this.logger.warn(`Could not reindex data, attempting to reset index`);
          await this.resetIndex();
          return true;
        }
      } else {
        // Nếu index không tồn tại, tạo mới
        await this.createFacilitiesIndex();
        this.logger.log(`Successfully created index with Vietnamese analyzer`);
        return true;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error updating index mappings: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      // Chỉ log lỗi, không throw, để ứng dụng vẫn chạy được
      return false;
    }
  }

  /**
   * Xóa hoàn toàn index hiện tại và tạo lại
   */
  async resetIndex(): Promise<any> {
    try {
      // Kiểm tra index có tồn tại không
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indices.facilities,
      });

      // Nếu index tồn tại, xóa nó
      if (indexExists) {
        try {
          // Kiểm tra xem facilities có phải là alias không
          const isAlias = await this.elasticsearchService.indices.existsAlias({
            name: this.indices.facilities,
          });

          if (isAlias) {
            // Nếu là alias, lấy danh sách các concrete indices gắn với alias này
            const getAliasResponse = await this.elasticsearchService.indices.getAlias({
              name: this.indices.facilities,
            });
            
            // Lấy danh sách các concrete indices
            const concreteIndices = Object.keys(getAliasResponse);
            
            this.logger.log(`Found concrete indices for alias ${this.indices.facilities}: ${concreteIndices.join(', ')}`);
            
            // Xóa từng concrete index
            for (const concreteIndex of concreteIndices) {
              this.logger.log(`Deleting concrete index ${concreteIndex}`);
              await this.elasticsearchService.indices.delete({
                index: concreteIndex,
              });
            }
          } else {
            // Nếu không phải alias, xóa index trực tiếp
            await this.elasticsearchService.indices.delete({
              index: this.indices.facilities,
            });
          }
          
          this.logger.log(`Deleted existing index/alias ${this.indices.facilities}`);
        } catch (deleteError) {
          this.logger.error(
            `Error deleting index/alias: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`,
            deleteError instanceof Error ? deleteError.stack : undefined,
          );
          throw deleteError;
        }
      }

      // Tạo lại index với settings và mappings mới
      await this.createFacilitiesIndex();
      this.logger.log(`Recreated index ${this.indices.facilities}`);

      return {
        success: true,
        message: `Index ${this.indices.facilities} has been reset successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error resetting index: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        success: false,
        message: `Failed to reset index: ${errorMessage}`,
      };
    }
  }

  /**
   * Kiểm tra mapping hiện tại của index
   */
  async checkMapping(index: string): Promise<any> {
    try {
      const mappingResult = await this.elasticsearchService.indices.getMapping({
        index,
      });
      return mappingResult;
    } catch (error) {
      this.logger.error(`Error checking mapping: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  /**
   * Test analyzer to see how text is tokenized
   * @param text Text to analyze
   * @param analyzer Analyzer to use
   * @returns Analysis result
   */
  async testAnalyzer(text: string, analyzer: string = 'vietnamese_search_analyzer'): Promise<any> {
    try {
      const result = await this.elasticsearchService.indices.analyze({
        index: this.indices.facilities,
        body: {
          analyzer,
          text
        }
      });
      
      return {
        success: true,
        analyzer,
        text,
        tokens: result.tokens?.map(token => ({
          token: token.token,
          start_offset: token.start_offset,
          end_offset: token.end_offset,
          position: token.position
        })) || []
      };
    } catch (error) {
      this.logger.error(`Error testing analyzer: ${error.message}`, error.stack);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Reindex dữ liệu sau khi thay đổi cấu trúc index
   */
  async reindexData(): Promise<any> {
    try {
      this.logger.log('Starting reindex process for Vietnamese accent support');
      
      // Kiểm tra số lượng tài liệu hiện có trước khi reindex
      const countResponse = await this.countDocuments(this.indices.facilities);
      const documentCount = countResponse.count;
      
      if (documentCount === 0) {
        this.logger.log('No documents to reindex');
        return { success: true, message: 'No documents to reindex' };
      }
      
      // Lấy tất cả dữ liệu hiện có
      const searchResponse = await this.elasticsearchService.search({
        index: this.indices.facilities,
        body: {
          size: 1000, // Giới hạn số lượng kết quả. Nếu có nhiều dữ liệu, cần triển khai scroll API
          query: {
            match_all: {}
          }
        }
      });
      
      if (!searchResponse.hits || !searchResponse.hits.hits || searchResponse.hits.hits.length === 0) {
        this.logger.log('No documents found for reindexing');
        return { success: true, message: 'No documents found for reindexing' };
      }
      
      // Chuẩn bị dữ liệu để reindex
      const documents = searchResponse.hits.hits.map(hit => {
        // Sửa lỗi: Spread types may only be created from object types
        const source = hit._source as Record<string, any>;
        return {
          id: hit._id,
          ...(source as object)
        };
      });
      
      // Tạm thời xóa index hiện tại
      const tempIndexName = `${this.indices.facilities}_temp_${Date.now()}`;
      
      // Tạo index tạm thời với cấu trúc mới
      await this.elasticsearchService.indices.create({
        index: tempIndexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding'
                  ]
                },
                vietnamese_search_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding'
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  completion: {
                    type: 'completion',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  }
                }
              },
              description: { 
                type: 'text', 
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer'
              },
              location: {
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                search_analyzer: 'vietnamese_search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  completion: {
                    type: 'completion',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  }
                }
              },
              avgRating: { type: 'float' },
              numberOfRating: { type: 'integer' },
              status: { type: 'keyword' },
              imagesUrl: { type: 'keyword' },
              openTime1: { type: 'keyword' },
              closeTime1: { type: 'keyword' },
              openTime2: { type: 'keyword' },
              closeTime2: { type: 'keyword' },
              openTime3: { type: 'keyword' },
              closeTime3: { type: 'keyword' },
              numberOfShifts: { type: 'integer' },
              sports: {
                type: 'nested',
                properties: {
                  id: { type: 'integer' },
                  name: {
                    type: 'text',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer',
                    fields: {
                      keyword: { type: 'keyword' },
                    },
                  },
                },
              },
              fieldGroups: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  name: { 
                    type: 'text',
                    analyzer: 'vietnamese_analyzer',
                    search_analyzer: 'vietnamese_search_analyzer'
                  },
                  basePrice: { type: 'float' },
                },
              },
              minPrice: { type: 'float' },
              maxPrice: { type: 'float' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            }
          }
        }
      });
      
      // Index dữ liệu vào index tạm thời
      await this.bulkIndex(tempIndexName, documents);
      
      // Tạo alias cho index
      const aliasExists = await this.elasticsearchService.indices.existsAlias({
        name: this.indices.facilities
      });
      
      if (aliasExists) {
        // Xóa alias cũ và thiết lập alias mới
        const getAliasResponse = await this.elasticsearchService.indices.getAlias({
          name: this.indices.facilities
        });
        
        const oldIndices = Object.keys(getAliasResponse);
        
        // Tạo action để cập nhật alias
        // Sửa lỗi: Argument of type is not assignable to parameter of type 'never'
        interface AliasAction {
          remove?: { index: string; alias: string };
          add?: { index: string; alias: string };
        }
        
        const actions: AliasAction[] = [];
        
        // Xóa alias cũ
        for (const oldIndex of oldIndices) {
          actions.push({
            remove: { index: oldIndex, alias: this.indices.facilities }
          });
        }
        
        // Thêm alias mới
        actions.push({
          add: { index: tempIndexName, alias: this.indices.facilities }
        });
        
        // Cập nhật alias
        await this.elasticsearchService.indices.updateAliases({
          body: {
            actions
          }
        });
        
        // Xóa index cũ sau khi đã chuyển alias
        for (const oldIndex of oldIndices) {
          await this.elasticsearchService.indices.delete({
            index: oldIndex
          });
        }
      } else {
        // Nếu không có alias, đổi tên index
        // Xóa index cũ nếu tồn tại
        const indexExists = await this.elasticsearchService.indices.exists({
          index: this.indices.facilities
        });
        
        if (indexExists) {
          await this.elasticsearchService.indices.delete({
            index: this.indices.facilities
          });
        }
        
        // Tạo alias cho index mới
        await this.elasticsearchService.indices.updateAliases({
          body: {
            actions: [
              { add: { index: tempIndexName, alias: this.indices.facilities } }
            ]
          }
        });
      }
      
      return {
        success: true,
        message: `Reindexed ${documents.length} documents with Vietnamese accent support`
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error reindexing data: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        message: `Failed to reindex data: ${errorMessage}`
      };
    }
  }
}

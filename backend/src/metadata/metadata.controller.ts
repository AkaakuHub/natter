import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { GetMetadataDto, UrlMetadataResponseDto } from './dto/url-metadata.dto';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  async getMetadata(
    @Query(new ValidationPipe({ transform: true })) query: GetMetadataDto,
  ): Promise<UrlMetadataResponseDto> {
    try {
      if (!query.url) {
        throw new HttpException(
          'URL parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.metadataService.getUrlMetadata(query.url);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        (error as Error).message || 'Failed to fetch metadata',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('clear-cache')
  async clearCache(): Promise<{ message: string; deletedCount: number }> {
    try {
      const deletedCount = await this.metadataService.clearAllCache();
      return { message: 'All cache cleared successfully', deletedCount };
    } catch {
      throw new HttpException(
        'Failed to clear cache',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

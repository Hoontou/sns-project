import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchGateway } from './search.gateway';
import { SearchController } from './search.controller';
import { ElasticIndex } from './elastic.index';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchGateway, ElasticIndex],
  exports: [SearchService],
})
export class SearchModule {}

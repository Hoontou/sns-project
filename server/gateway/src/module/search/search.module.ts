import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchGateway } from './search.gateway';

@Module({
  providers: [SearchService, SearchGateway],
  exports: [SearchService],
})
export class SearchModule {}

import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchGateway } from './search.gateway';
import { SearchController } from './search.controller';
import { ElasticIndex } from './elastic.index';
import { MongooseModule } from '@nestjs/mongoose';
import { HashtagSchema } from './repository/hashtag.schema';
import { HashtagCollection } from './repository/hashtag.collection';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'hashtag', schema: HashtagSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchGateway, ElasticIndex, HashtagCollection],
  exports: [SearchService],
})
export class SearchModule {}

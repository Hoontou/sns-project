import { Body, Controller, Post } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post('/searchHashtagsBySearchString')
  searchHashtagsBySearchString(
    @Body() body: { searchString: string; page: number },
  ) {
    return this.searchService.searchHashtagsBySearchString(body);
  }

  @Post('/searchusersbysearchstring')
  searchUsersBySearchString(
    @Body() body: { searchString: string; page: number },
  ) {
    return this.searchService.searchUsersBySearchString(body);
  }
}

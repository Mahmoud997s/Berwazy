import { Controller, Get, Param, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get(':slug')
  async getCollection(@Param('slug') slug: string, @Query() query: any) {
    const queryObj: any = { ...query };
    ['orientation', 'color', 'size', 'material', 'onSale'].forEach(key => {
      if (queryObj[key]) {
        queryObj[key] = Array.isArray(queryObj[key]) ? queryObj[key] : [queryObj[key]];
      }
    });

    return this.collectionsService.getCollectionBySlug(slug, queryObj);
  }
}

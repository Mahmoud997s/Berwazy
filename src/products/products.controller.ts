import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('collectionId') collectionId?: string,
  ) {
    return this.productsService.getProducts({
      search,
      sort,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      collectionId: collectionId ? parseInt(collectionId, 10) : undefined,
    });
  }

  @Get(':slug')
  async getProduct(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }
}

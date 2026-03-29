import { Controller, Get, Post, Delete, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('wishlist')
@UseGuards(AuthenticatedGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  async addToWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any
  ) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Post(':productId/toggle')
  async toggleWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any
  ) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  async removeFromWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  @Get(':productId/check')
  async checkWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any
  ) {
    const isInWishlist = await this.wishlistService.isInWishlist(req.user.id, productId);
    return { isInWishlist };
  }
}

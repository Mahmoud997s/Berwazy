import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

function getSessionId(req: Request): string {
  // @ts-ignore - The types for express-session might be missing or incomplete here, but it works at runtime
  if (!req.session.id) {
    // @ts-ignore
    req.session.id = randomUUID();
  }
  // @ts-ignore
  return req.session.id;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: Request) {
    return this.cartService.getCart(getSessionId(req));
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Body('variantId', ParseIntPipe) variantId: number,
    @Body('qty', ParseIntPipe) qty: number
  ) {
    return this.cartService.addCartItem(getSessionId(req), variantId, qty);
  }

  @Patch('items/:id')
  async updateItem(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body('qty', ParseIntPipe) qty: number
  ) {
    return this.cartService.updateCartItem(getSessionId(req), id, qty);
  }

  @Delete('items/:id')
  async deleteItem(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.cartService.deleteCartItem(getSessionId(req), id);
  }
}

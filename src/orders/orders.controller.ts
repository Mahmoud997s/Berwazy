import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    if (!req.user) {
        // Handle guest guest orders if needed, but for now expect user
    }
    return this.ordersService.createOrder({
      userId: req.user?.id || 0,
      shippingAddress: body.shippingAddress,
      items: body.items,
      totalAmount: body.totalAmount,
    });
  }
}

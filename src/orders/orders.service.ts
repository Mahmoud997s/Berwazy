import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DB_CONNECTION, type DrizzleDB } from '../db/db.module';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: DrizzleDB,
    private readonly mailService: MailService,
  ) {}

  async createOrder(data: {
    userId: number;
    shippingAddress: string;
    items: { productId: number; variantId: number; quantity: number; priceAtPurchase: number }[];
    totalAmount: number;
  }) {
    // 1. Insert order
    const [order] = await this.db.insert(schema.orders).values({
      userId: data.userId,
      shippingAddress: data.shippingAddress,
      totalAmount: data.totalAmount,
      status: 'pending',
    } as any).returning();

    // 2. Insert items
    for (const item of data.items) {
      await this.db.insert(schema.orderItems).values({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      } as any);
    }

    // 3. Fetch user for email
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, data.userId));

    // 4. Send Confirmation Email
    if (user) {
      this.mailService.sendTemplateEmail(user.email, 'order_confirmation', {
        user_name: user.name,
        order_id: order.id.toString(),
        total_amount: `€${(data.totalAmount / 100).toFixed(2)}`,
        store_name: 'BRAWEZZ.',
      }).catch(err => console.error(`Order email failed: ${err.message}`));
    }

    return order;
  }
}

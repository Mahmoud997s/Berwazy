import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DB_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly mailService: MailService,
  ) {}

  async getStats() {
    // Basic Counts
    const [productCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(schema.products);
    const [userCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
    
    // Sales & Orders
    const [salesData] = await this.db.select({ 
      total: sql<number>`sum(total_amount)::int`,
      count: sql<number>`count(*)::int` 
    }).from(schema.orders).where(eq(schema.orders.status, 'delivered')); // Only count delivered for actual sales
    
    const [pendingOrders] = await this.db.select({ count: sql<number>`count(*)::int` }).from(schema.orders).where(eq(schema.orders.status, 'pending'));

    // Visitors (Recent Sessions - last 24h)
    const visitorData = await this.db.execute(sql`SELECT count(distinct sid)::int as count FROM session WHERE expire > now()`);
    const visitorCount = (visitorData.rows[0] as any)?.count || 0;

    // Abandoned Carts (Carts older than 2h with at least one item, but no successful order for that user/session)
    // For simplicity, we count carts with items that haven't been converted
    const [abandonedCount] = await this.db.select({ count: sql<number>`count(distinct ${schema.carts.id})::int` })
      .from(schema.carts)
      .innerJoin(schema.cartItems, eq(schema.carts.id, schema.cartItems.cartId))
      .where(sql`${schema.carts.createdAt} < now() - interval '2 hours'`);

    // Top Selling Products (by quantity)
    const topProducts = await this.db.select({
      id: schema.products.id,
      title: schema.products.title,
      totalSold: sql<number>`sum(${schema.orderItems.quantity})::int`
    })
    .from(schema.orderItems)
    .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
    .groupBy(schema.products.id, schema.products.title)
    .orderBy(desc(sql`sum(${schema.orderItems.quantity})`))
    .limit(5);

    // Alerts (Low Stock)
    const lowStock = await this.db.select({
      id: schema.products.id,
      title: schema.products.title,
      sku: schema.variants.sku
    })
    .from(schema.variants)
    .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
    .where(eq(schema.variants.inStock, false))
    .limit(5);

    return {
      products: productCount.count,
      users: userCount.count,
      totalSalesCents: salesData.total || 0,
      deliveredOrders: salesData.count || 0,
      pendingOrders: pendingOrders.count,
      visitors: visitorCount,
      abandonedCarts: abandonedCount.count,
      topProducts,
      alerts: lowStock.map(item => `Low Stock: ${item.title} (${item.sku})`),
    };
  }

  // ─── Banners ────────────────────────────────────────────
  async getAllBanners() {
    return this.db.select().from(schema.banners).orderBy(asc(schema.banners.sort));
  }

  async createBanner(data: {
    title?: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    linkText?: string;
    secondaryLinkUrl?: string;
    secondaryLinkText?: string;
    sort?: number;
    isActive?: boolean;
  }) {
    const [banner] = await this.db.insert(schema.banners).values(data).returning();
    return banner;
  }

  async updateBanner(id: number, data: Partial<{
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    linkText: string;
    secondaryLinkUrl: string;
    secondaryLinkText: string;
    sort: number;
    isActive: boolean;
  }>) {
    const [banner] = await this.db.update(schema.banners)
      .set(data as any)
      .where(eq(schema.banners.id, id))
      .returning();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async deleteBanner(id: number) {
    const [deleted] = await this.db.delete(schema.banners)
      .where(eq(schema.banners.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Banner not found');
    return deleted;
  }

  // ─── Orders ───────────────────────────────────────────────
  async getAllOrders() {
    return await this.db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        user: true,
        items: {
          with: {
            product: {
              with: {
                images: true
              }
            },
            variant: true,
          }
        }
      }
    });
  }

  async updateOrder(id: number, data: {
    status?: string;
    trackingNumber?: string;
    internalNotes?: string;
  }) {
    const [updated] = await this.db.update(schema.orders)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(schema.orders.id, id))
      .returning();
    
    if (!updated) throw new NotFoundException('Order not found');

    // Trigger notification if status changed
    if (data.status) {
       this.sendOrderStatusEmail(id, data.status).catch(err => console.error(`Status email failed: ${err.message}`));
    }

    return updated;
  }

  private async sendOrderStatusEmail(orderId: number, status: string) {
    const order = await this.db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: { user: true }
    });

    if (order?.user) {
      // We can use a generic status template or specific ones
      await this.mailService.sendTemplateEmail(order.user.email, 'order_status_update', {
        user_name: order.user.name,
        order_id: order.id.toString(),
        status_text: status === 'shipped' ? 'تم الشحن' : status,
        store_name: 'BRAWEZZ.',
      });
    }
  }

  async deleteOrder(id: number) {
    // Delete items first to maintain FK integrity without cascade
    await this.db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id));

    const [deleted] = await this.db.delete(schema.orders)
      .where(eq(schema.orders.id, id))
      .returning();
    
    if (!deleted) throw new NotFoundException('Order not found');
    return deleted;
  }

  async reorderBanners(ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      await this.db.update(schema.banners)
        .set({ sort: i } as any)
        .where(eq(schema.banners.id, ids[i]));
    }
    return this.getAllBanners();
  }

  // ─── Categories (Collections) ──────────────────────────
  async getAllCategories() {
    const collections = await this.db.query.collections.findMany({
      orderBy: [asc(schema.collections.sort)],
      with: { products: true },
    });
    return collections.map(c => ({
      ...c,
      productCount: c.products?.length || 0,
    }));
  }

  async createCategory(data: {
    slug: string;
    title: string;
    description?: string;
    imageUrl?: string;
    sort?: number;
    isActive?: boolean;
  }) {
    const [collection] = await this.db.insert(schema.collections).values(data).returning();
    return collection;
  }

  async updateCategory(id: number, data: Partial<{
    slug: string;
    title: string;
    description: string;
    imageUrl: string;
    sort: number;
    isActive: boolean;
  }>) {
    const [collection] = await this.db.update(schema.collections)
      .set(data as any)
      .where(eq(schema.collections.id, id))
      .returning();
    if (!collection) throw new NotFoundException('Category not found');
    return collection;
  }

  async deleteCategory(id: number) {
    // Delete associated collection_products first
    await this.db.delete(schema.collectionProducts)
      .where(eq(schema.collectionProducts.collectionId, id));
    const [deleted] = await this.db.delete(schema.collections)
      .where(eq(schema.collections.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Category not found');
    return deleted;
  }

  // ─── Products ──────────────────────────────────────────
  async getAllProducts(search?: string, collectionId?: number) {
    const products = await this.db.query.products.findMany({
      orderBy: [desc(schema.products.createdAt)],
      with: {
        images: { orderBy: [asc(schema.productImages.sort)] },
        variants: true,
        collections: {
          with: { collection: true },
        },
        relatedProducts: {
          with: { relatedProduct: true },
        },
      },
    });

    let filtered = products;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (collectionId) {
      filtered = filtered.filter(p => p.collections?.some((cp: any) => cp.collectionId === collectionId));
    }

    return filtered.map(p => ({
      ...p,
      collections: p.collections?.map((cp: any) => cp.collection) || [],
      relatedProducts: p.relatedProducts?.map((rp: any) => rp.relatedProduct) || [],
    }));
  }

  async createProduct(data: {
    slug: string;
    title: string;
    description?: string;
    orientation: string;
    color: string;
    isSale?: boolean;
    salePct?: number;
    collectionIds?: number[];
    relatedProductIds?: number[];
    variants?: { material: string; size: string; priceCents: number; sku: string; inStock?: boolean }[];
    imageUrls?: string[];
    tags?: string[];
  }) {
    const { collectionIds, relatedProductIds, variants, imageUrls, ...productData } = data;

    // Insert product
    const [product] = await this.db.insert(schema.products).values(productData).returning();

    // Link to collections
    if (collectionIds?.length) {
      await this.db.insert(schema.collectionProducts).values(
        collectionIds.map(cid => ({ collectionId: cid, productId: product.id }))
      );
    }

    // Link to related products
    if (relatedProductIds?.length) {
      await this.db.insert(schema.relatedProducts).values(
        relatedProductIds.map(rid => ({ productId: product.id, relatedProductId: rid }))
      );
    }

    // Insert variants
    if (variants?.length) {
      await this.db.insert(schema.variants).values(
        variants.map(v => ({ ...v, productId: product.id, inStock: v.inStock ?? true }))
      );
    }

    // Insert images
    if (imageUrls?.length) {
      await this.db.insert(schema.productImages).values(
        imageUrls.map((url, i) => ({ productId: product.id, url, alt: data.title, sort: i }))
      );
    }

    return product;
  }

  async updateProduct(id: number, data: Partial<{
    slug: string;
    title: string;
    description: string;
    orientation: string;
    color: string;
    isSale: boolean;
    salePct: number;
    collectionIds: number[];
    relatedProductIds: number[];
    variants: { id?: number; material: string; size: string; priceCents: number; sku: string; inStock?: boolean }[];
    tags: string[];
  }>) {
    const { collectionIds, relatedProductIds, variants, ...productData } = data;

    // Update product fields
    if (Object.keys(productData).length > 0) {
      const [product] = await this.db.update(schema.products)
        .set(productData as any)
        .where(eq(schema.products.id, id))
        .returning();
      if (!product) throw new NotFoundException('Product not found');
    }

    // Update collection links
    if (collectionIds !== undefined) {
      await this.db.delete(schema.collectionProducts)
        .where(eq(schema.collectionProducts.productId, id));
      if (collectionIds.length > 0) {
        await this.db.insert(schema.collectionProducts).values(
          collectionIds.map(cid => ({ collectionId: cid, productId: id }))
        );
      }
    }

    // Update related product links
    if (relatedProductIds !== undefined) {
      await this.db.delete(schema.relatedProducts)
        .where(eq(schema.relatedProducts.productId, id));
      if (relatedProductIds.length > 0) {
        await this.db.insert(schema.relatedProducts).values(
          relatedProductIds.map(rid => ({ productId: id, relatedProductId: rid }))
        );
      }
    }

    // Update variants (delete old + insert new)
    if (variants !== undefined) {
      await this.db.delete(schema.variants)
        .where(eq(schema.variants.productId, id));
      if (variants.length > 0) {
        await this.db.insert(schema.variants).values(
          variants.map(v => ({ ...v, productId: id, inStock: v.inStock ?? true }))
        );
      }
    }

    return this.getProductById(id);
  }

  async getProductById(id: number) {
    const product = await this.db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        images: { orderBy: [asc(schema.productImages.sort)] },
        variants: true,
        collections: { with: { collection: true } },
        relatedProducts: { with: { relatedProduct: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return {
      ...product,
      collections: product.collections?.map((cp: any) => cp.collection) || [],
      relatedProducts: product.relatedProducts?.map((rp: any) => rp.relatedProduct) || [],
    };
  }

  async deleteProduct(id: number) {
    await this.db.delete(schema.relatedProducts).where(sql`product_id = ${id} OR related_product_id = ${id}`);
    await this.db.delete(schema.collectionProducts).where(eq(schema.collectionProducts.productId, id));
    await this.db.delete(schema.productImages).where(eq(schema.productImages.productId, id));
    await this.db.delete(schema.variants).where(eq(schema.variants.productId, id));
    const [deleted] = await this.db.delete(schema.products).where(eq(schema.products.id, id)).returning();
    if (!deleted) throw new NotFoundException('Product not found');
    return deleted;
  }

  async addProductImage(productId: number, url: string, alt?: string) {
    const images = await this.db.select().from(schema.productImages).where(eq(schema.productImages.productId, productId));
    const [image] = await this.db.insert(schema.productImages).values({
      productId,
      url,
      alt: alt || '',
      sort: images.length,
    } as any).returning();
    return image;
  }

  async deleteProductImage(productId: number, imageId: number) {
    const [deleted] = await this.db.delete(schema.productImages)
      .where(eq(schema.productImages.id, imageId))
      .returning();
    if (!deleted) throw new NotFoundException('Image not found');
    return deleted;
  }

  // ─── Customers ──────────────────────────────────────────
  async getAllCustomers() {
    // We select users with 'user' role and perform a join/subquery for stats
    // For simplicity with Drizzle's query API:
    const customers = await this.db.query.users.findMany({
      where: eq(schema.users.role, "user"),
      with: {
        orders: true,
      }
    });

    return customers.map(user => {
      const orders = user.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      return {
        ...user,
        orderCount: orders.length,
        totalSpentCents: totalSpent,
        lastOrderDate: orders.length > 0 ? [...orders].sort((a,b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        })[0]?.createdAt : null,
      };
    });
  }

  async updateCustomer(id: number, data: { isActive?: boolean; internalNotes?: string }) {
    const [updated] = await this.db.update(schema.users)
      .set(data as any)
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updated) throw new NotFoundException('Customer not found');
    return updated;
  }

  // ─── Shipping Rates ─────────────────────────────────────
  async getAllShippingRates() {
    return this.db.select().from(schema.shippingRates).orderBy(asc(schema.shippingRates.region));
  }

  async saveShippingRate(data: { id?: number; region: string; priceCents: number; estimatedDays?: string; isActive?: boolean }) {
    if (data.id) {
      const { id, ...updateData } = data;
      const [updated] = await this.db.update(schema.shippingRates)
        .set(updateData as any)
        .where(eq(schema.shippingRates.id, id))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db.insert(schema.shippingRates).values(data as any).returning();
      return inserted;
    }
  }

  async deleteShippingRate(id: number) {
    const [deleted] = await this.db.delete(schema.shippingRates).where(eq(schema.shippingRates.id, id)).returning();
    return deleted;
  }

  // ─── Store Settings ─────────────────────────────────────
  async getStoreSettings() {
    return this.db.select().from(schema.storeSettings);
  }

  async updateStoreSetting(key: string, value: string) {
    const existing = await this.db.select().from(schema.storeSettings).where(eq(schema.storeSettings.key, key));
    if (existing.length > 0) {
      const [updated] = await this.db.update(schema.storeSettings)
        .set({ value, updatedAt: new Date() } as any)
        .where(eq(schema.storeSettings.key, key))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db.insert(schema.storeSettings).values({ key, value }).returning();
      return inserted;
    }
  }

  // ─── Coupons ────────────────────────────────────────────
  async getAllCoupons() {
    return this.db.select().from(schema.coupons).orderBy(desc(schema.coupons.createdAt));
  }

  async saveCoupon(data: {
    id?: number;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    expiresAt?: Date;
    isActive?: boolean;
  }) {
    if (data.id) {
      const { id, ...updateData } = data;
      const [updated] = await this.db.update(schema.coupons)
        .set(updateData as any)
        .where(eq(schema.coupons.id, id))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db.insert(schema.coupons).values(data as any).returning();
      return inserted;
    }
  }

  async deleteCoupon(id: number) {
    const [deleted] = await this.db.delete(schema.coupons).where(eq(schema.coupons.id, id)).returning();
    return deleted;
  }

  // ─── Email Templates ──────────────────────────────────────
  async getAllEmailTemplates() {
    return this.db.select().from(schema.emailTemplates).orderBy(asc(schema.emailTemplates.name));
  }

  async getEmailTemplateByName(name: string) {
    const [template] = await this.db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.name, name));
    return template;
  }

  async saveEmailTemplate(data: {
    id?: number;
    name: string;
    subject: string;
    body: string;
    description?: string;
  }) {
    if (data.id) {
      const { id, ...updateData } = data;
      const [updated] = await this.db.update(schema.emailTemplates)
        .set({ ...updateData, updatedAt: new Date() } as any)
        .where(eq(schema.emailTemplates.id, id))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db.insert(schema.emailTemplates).values(data as any).returning();
      return inserted;
    }
  }

  async deleteEmailTemplate(id: number) {
    const [deleted] = await this.db.delete(schema.emailTemplates).where(eq(schema.emailTemplates.id, id)).returning();
    return deleted;
  }

  async seedEmailTemplates() {
    const templates = [
      {
        name: "welcome",
        subject: "أهلاً بك في {{store_name}} ⚽",
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">مرحباً {{user_name}}!</h1>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">سعيدون جداً بانضمامك لعائلة {{store_name}}. الآن يمكنك تسوق أفضل بوسترات كرة القدم بأعلى جودة.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-[10px]; font-weight: bold; color: #999; text-transform: uppercase;">استمتع بالتسوق،<br>فريق {{store_name}}</p>
            </div>
          </div>
        `,
        description: "يُرسل عند تسجيل مستخدم جديد بنجاح."
      },
      {
        name: "order_confirmation",
        subject: "تأكيد طلبك #{{order_id}} من {{store_name}}",
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">تم استلام طلبك!</h1>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">مرحباً {{user_name}}، شكراً لتسوقك معنا. نحن الآن نقوم بتجهيز طلبك رقم #{{order_id}}.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="margin: 0; font-weight: bold;">إجمالي الطلب: {{total_amount}}</p>
            </div>
            <p style="font-size: 14px; color: #888;">سنقوم بإخطارك بمجرد شحن الطلب.</p>
          </div>
        `,
        description: "يُرسل فور إتمام عملية الشراء."
      },
      {
        name: "password_reset",
        subject: "رابط استعادة كلمة المرور - {{store_name}}",
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">استعادة كلمة المرور</h1>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">لقد طلبت استعادة كلمة المرور. اضغط على الزر أدناه للمتابعة:</p>
            <a href="{{reset_link}}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 20px 0;">تغيير كلمة المرور</a>
            <p style="font-size: 12px; color: #999;">إذا لم تطلب هذا، يمكنك تجاهل هذا الإيميل.</p>
          </div>
        `,
        description: "يُرسل عند طلب العميل استعادة كلمة المرور."
      },
      {
        name: "order_status_update",
        subject: "تحديث بخصوص طلبك #{{order_id}} - {{store_name}}",
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">تحديث حالة الطلب</h1>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">مرحباً {{user_name}}، حالة طلبك #{{order_id}} تغيرت الآن إلى:</p>
            <div style="display: inline-block; background: #00c0b5; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: bold; margin: 20px 0;">{{status_text}}</div>
            <p style="font-size: 14px; color: #888;">يمكنك متابعة تفاصيل الطلب من حسابك في المتجر.</p>
          </div>
        `,
        description: "يُرسل عند تغيير حالة الطلب (شحن، توصيل، إلخ)."
      }
    ];

    for (const template of templates) {
      await this.db.insert(schema.emailTemplates).values(template as any).onConflictDoUpdate({
        target: [schema.emailTemplates.name],
        set: {
          subject: template.subject,
          body: template.body,
          description: template.description,
          updatedAt: new Date(),
        } as any
      });
    }
    return { success: true };
  }
}

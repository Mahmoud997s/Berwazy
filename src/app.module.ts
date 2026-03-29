import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DbModule } from './db/db.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { RedirectsModule } from './redirects/redirects.module';
import { MediaModule } from './media/media.module';
import { MailModule } from './mail/mail.module';
import { BlogModule } from './blog/blog.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    DbModule,
    ProductsModule,
    CollectionsModule,
    CartModule,
    AuthModule,
    WishlistModule,
    AdminModule,
    SettingsModule,
    RedirectsModule,
    MediaModule,
    MailModule,
    OrdersModule,
    BlogModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

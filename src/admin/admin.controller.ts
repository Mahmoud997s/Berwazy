import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Email Templates ──────────────────────────────────────
  @Get('email-templates')
  getEmailTemplates(@Req() req: any) {
    console.log(`[Trace] AdminController - Fetching email templates. User: ${req.user?.email || 'Anonymous'}`);
    return this.adminService.getAllEmailTemplates();
  }

  @Post('email-templates')
  saveEmailTemplate(@Body() body: any) {
    return this.adminService.saveEmailTemplate(body);
  }

  @Delete('email-templates/:id')
  deleteEmailTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteEmailTemplate(id);
  }

  @Post('email-templates/seed')
  seedEmailTemplates() {
    return this.adminService.seedEmailTemplates();
  }

  // ─── Authentication ───────────────────────────────────────
  @Post('login')
  async login(@Body() body: any, @Req() req: any, @Res() res: any) {
    if (body.email === 'adminstartor@store.me' && body.password === '145202@admin') {
      // Create a mock user object representing the admin
      const adminUser = { id: 0, email: body.email, role: 'admin', name: 'Administrator' };
      
      return new Promise((resolve, reject) => {
        req.login(adminUser, (err: any) => {
          if (err) {
            reject(new UnauthorizedException('Login failed internal err'));
          } else {
            resolve(res.json({ message: 'Login successful', user: adminUser }));
          }
        });
      });
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  // ─── Stats ──────────────────────────────────────────────
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── Orders ─────────────────────────────────────────────
  @Get('orders')
  getOrders() {
    return this.adminService.getAllOrders();
  }

  @Patch('orders/:id')
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status?: string; trackingNumber?: string; internalNotes?: string }
  ) {
    return this.adminService.updateOrder(id, body);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteOrder(id);
  }

  // ─── Banners ────────────────────────────────────────────
  @Get('banners')
  getBanners() {
    return this.adminService.getAllBanners();
  }

  @Post('banners')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/banners',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `banner-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  createBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.adminService.createBanner({
      ...body,
      imageUrl: file ? `/uploads/banners/${file.filename}` : body.imageUrl,
      sort: body.sort ? parseInt(body.sort) : 0,
      isActive: body.isActive !== 'false',
    });
  }

  @Patch('banners/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/banners',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `banner-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const data: any = { ...body };
    if (file) data.imageUrl = `/uploads/banners/${file.filename}`;
    if (data.sort) data.sort = parseInt(data.sort);
    if (data.isActive !== undefined) data.isActive = data.isActive !== 'false' && data.isActive !== false;
    return this.adminService.updateBanner(id, data);
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBanner(id);
  }

  @Patch('banners/reorder')
  reorderBanners(@Body('ids') ids: number[]) {
    return this.adminService.reorderBanners(ids);
  }

  // ─── Categories ────────────────────────────────────────
  @Get('categories')
  getCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cat-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.adminService.createCategory({
      ...body,
      imageUrl: file ? `/uploads/categories/${file.filename}` : body.imageUrl,
      sort: body.sort ? parseInt(body.sort) : 0,
      isActive: body.isActive !== 'false',
    });
  }

  @Patch('categories/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cat-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const data: any = { ...body };
    if (file) data.imageUrl = `/uploads/categories/${file.filename}`;
    if (data.sort) data.sort = parseInt(data.sort);
    if (data.isActive !== undefined) data.isActive = data.isActive !== 'false' && data.isActive !== false;
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Products ──────────────────────────────────────────
  @Get('products')
  getProducts(@Query('search') search?: string, @Query('collectionId') collectionId?: string) {
    return this.adminService.getAllProducts(search, collectionId ? parseInt(collectionId) : undefined);
  }

  @Get('products/:id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getProductById(id);
  }

  @Post('products')
  createProduct(@Body() body: any) {
    return this.adminService.createProduct({
      ...body,
      salePct: body.salePct ? parseInt(body.salePct) : 0,
      isSale: body.isSale === true || body.isSale === 'true',
      collectionIds: body.collectionIds || [],
      variants: (body.variants || []).map((v: any) => ({
        ...v,
        priceCents: parseInt(v.priceCents),
        inStock: v.inStock !== false && v.inStock !== 'false',
      })),
      imageUrls: body.imageUrls || [],
    });
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data: any = { ...body };
    if (data.salePct !== undefined) data.salePct = parseInt(data.salePct);
    if (data.isSale !== undefined) data.isSale = data.isSale === true || data.isSale === 'true';
    if (data.variants) {
      data.variants = data.variants.map((v: any) => ({
        ...v,
        priceCents: parseInt(v.priceCents),
        inStock: v.inStock !== false && v.inStock !== 'false',
      }));
    }
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  @Post('products/:id/images')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `prod-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  addProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt?: string,
  ) {
    return this.adminService.addProductImage(id, `/uploads/products/${file.filename}`, alt);
  }

  @Delete('products/:id/images/:imageId')
  deleteProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.adminService.deleteProductImage(id, imageId);
  }

  // ─── Customers ──────────────────────────────────────────
  @Get('customers')
  getCustomers() {
    return this.adminService.getAllCustomers();
  }

  @Patch('customers/:id')
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive?: boolean; internalNotes?: string }
  ) {
    return this.adminService.updateCustomer(id, body);
  }

  // ─── Shipping & Settings ────────────────────────────────
  @Get('shipping-rates')
  getShippingRates() {
    return this.adminService.getAllShippingRates();
  }

  @Post('shipping-rates')
  saveShippingRate(@Body() body: any) {
    return this.adminService.saveShippingRate(body);
  }

  @Delete('shipping-rates/:id')
  deleteShippingRate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteShippingRate(id);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getStoreSettings();
  }

  @Post('settings')
  updateSetting(@Body() body: { key: string; value: string }) {
    return this.adminService.updateStoreSetting(body.key, body.value);
  }

  // ─── Coupons ────────────────────────────────────────────
  @Get('coupons')
  getCoupons() {
    return this.adminService.getAllCoupons();
  }

  @Post('coupons')
  saveCoupon(@Body() body: any) {
    return this.adminService.saveCoupon(body);
  }

  @Delete('coupons/:id')
  deleteCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCoupon(id);
  }
}


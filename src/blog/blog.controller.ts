import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ─── Public Endpoints ─────────────────────────────────────
  
  @Get()
  getPublishedPosts() {
    return this.blogService.getAllPosts(false);
  }

  @Get('post/:slug')
  getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  // ─── Admin Endpoints ──────────────────────────────────────
  
  @Get('admin/all')
  @UseGuards(AdminGuard)
  getAllPostsAdmin() {
    return this.blogService.getAllPosts(true);
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  getPostByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getPostById(id);
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  createPost(@Body() body: any, @Req() req: any) {
    // req.user.id is available from the session/guard
    return this.blogService.createPost(body, req.user?.id);
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.blogService.updatePost(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deletePost(id);
  }
}

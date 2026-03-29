import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('api/v1/media')
@UseGuards(AdminGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
    @Body('altText') altText?: string,
  ) {
    return this.mediaService.uploadFile(
      file,
      folderId ? parseInt(folderId) : undefined,
      altText,
    );
  }

  @Get()
  async getMedia(@Query('folderId') folderId?: string) {
    return this.mediaService.getAllMedia(folderId ? parseInt(folderId) : undefined);
  }

  @Delete(':id')
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.deleteMedia(id);
  }

  @Post('folders')
  async createFolder(@Body('name') name: string, @Body('parentId') parentId?: number) {
    return this.mediaService.createFolder(name, parentId);
  }

  @Get('folders')
  async getFolders(@Query('parentId') parentId?: string) {
    return this.mediaService.getFolders(parentId ? parseInt(parentId) : undefined);
  }

  @Delete('folders/:id')
  async deleteFolder(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.deleteFolder(id);
  }
}

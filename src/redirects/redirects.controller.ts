import { Controller, Get, Post, Body, Query, NotFoundException } from '@nestjs/common';
import { RedirectsService } from './redirects.service';

@Controller('api/v1/redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get('check')
  async checkRedirect(@Query('source') source: string) {
    if (!source) return null;
    const redirect = await this.redirectsService.getRedirectBySource(source);
    if (!redirect) return null;
    return redirect;
  }

  @Get()
  async getAll() {
    return await this.redirectsService.getAllRedirects();
  }

  @Post()
  async create(@Body() data: { source: string; destination: string; permanent?: boolean }) {
    return await this.redirectsService.createRedirect(data);
  }
}

import { Controller, Post, Body, Get, UseGuards, Request, Res, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return req.user;
  }

  @Get('logout')
  logout(@Request() req: any, @Res() res: Response) {
    req.logout((err: any) => {
      if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      res.status(HttpStatus.OK).send();
    });
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req: any) {
    // Redirects to Google Login
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    // Redirect back to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  @UseGuards(AuthenticatedGuard)
  @Post('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('password')
  async updatePassword(@Request() req: any, @Body() body: any) {
    return this.authService.updatePassword(req.user.id, body);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `/uploads/${file.filename}`;
    await this.authService.updateProfile(req.user.id, { avatarUrl });
    return { avatarUrl };
  }
}

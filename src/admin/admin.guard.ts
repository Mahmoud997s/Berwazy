import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    
    if (req.path === '/api/v1/admin/login') {
      return true;
    }

    if (!req.isAuthenticated()) {
      throw new ForbiddenException('Authentication required');
    }
    
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    
    return true;
  }
}

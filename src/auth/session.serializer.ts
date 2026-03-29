import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): void {
    done(null, { id: user.id });
  }

  async deserializeUser(payload: any, done: (err: Error | null, user: any) => void): Promise<void> {
    if (payload.id === 0) {
      return done(null, { id: 0, email: 'adminstartor@store.me', role: 'admin', name: 'Administrator' });
    }
    try {
      const user = await this.authService.findById(payload.id);
      done(null, user);
    } catch (error) {
      done(error as Error, null);
    }
  }
}

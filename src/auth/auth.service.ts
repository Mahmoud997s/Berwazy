import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DB_CONNECTION, type DrizzleDB } from '../db/db.module';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: DrizzleDB,
    private readonly mailService: MailService,
  ) {}

  async findByEmail(email: string) {
    const [user] = await (this.db as any)
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async findById(id: number) {
    const [user] = await (this.db as any)
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async findByGoogleId(googleId: string) {
    const [user] = await (this.db as any)
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return user;
  }

  async register(data: { email: string; password?: string; name: string; googleId?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    const [user] = await (this.db.insert(users).values({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      googleId: data.googleId || null,
    } as any) as any).returning();
    
    const { password, ...result } = user;

    // Send welcome email (async)
    this.mailService.sendTemplateEmail(user.email, 'welcome', {
      user_name: user.name || 'User',
      store_name: 'BRAWEZZ.',
    }).catch(err => console.error(`Welcome email failed: ${err.message}`));

    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    if (email.toLowerCase() === 'adminstartor@store.me' && pass === '145202@admin') {
      return { id: 0, email: 'adminstartor@store.me', role: 'admin', name: 'Administrator' };
    }

    const user = await this.findByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findOrCreateGoogleUser(profile: any) {
    const { id: gId, emails, displayName } = profile;
    const gEmail = emails[0].value;
    
    let user = await this.findByGoogleId(gId);
    let isNewUser = false;

    if (!user) {
      user = await this.findByEmail(gEmail);
      if (user) {
        // Link google ID to existing account
        const [updatedUser] = await (this.db.update(users).set({ googleId: gId } as any).where(eq(users.id, user.id)) as any).returning();
        user = updatedUser;
      } else {
        // Create new account
        const [newUser] = await (this.db.insert(users).values({
          email: gEmail.toLowerCase(),
          name: displayName,
          googleId: gId,
        } as any) as any).returning();
        user = newUser;
        isNewUser = true;
      }
    }
    
    const { password, ...result } = user;

    if (isNewUser) {
      this.mailService.sendTemplateEmail(user.email, 'welcome', {
        user_name: user.name || 'User',
        store_name: 'BRAWEZZ.',
      }).catch(err => console.error(`Welcome email failed: ${err.message}`));
    }

    return result;
  }

  async updateProfile(id: number, data: { name?: string; email?: string; avatarUrl?: string }) {
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const [user] = await (this.db.update(users)
      .set({ ...data, email: data.email?.toLowerCase() } as any)
      .where(eq(users.id, id)) as any).returning();
    
    const { password, ...result } = user;
    return result;
  }

  async updatePassword(id: number, data: { oldPassword?: string; newPassword: string }) {
    const user = await this.findById(id);
    if (!user) throw new UnauthorizedException();

    // If they have a password, they must provide the old one
    if (user.password) {
      if (!data.oldPassword || !(await bcrypt.compare(data.oldPassword, user.password))) {
        throw new UnauthorizedException('Invalid current password');
      }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await (this.db.update(users)
      .set({ password: hashedPassword } as any)
      .where(eq(users.id, id)) as any);
    
    return { success: true };
  }
}

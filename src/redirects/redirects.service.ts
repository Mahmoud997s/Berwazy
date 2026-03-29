import { Injectable, Inject } from '@nestjs/common';
import { db } from '@/lib/db';
import { redirects } from '@/shared/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RedirectsService {
  async getRedirectBySource(source: string) {
    const results = await db.select().from(redirects).where(eq(redirects.source, source)).limit(1);
    return results[0] || null;
  }

  async getAllRedirects() {
    return await db.select().from(redirects);
  }

  async createRedirect(data: { source: string; destination: string; permanent?: boolean }) {
    return await db.insert(redirects).values(data).returning();
  }
}

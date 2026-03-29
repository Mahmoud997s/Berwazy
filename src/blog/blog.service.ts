import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION, type DrizzleDB } from '../db/db.module';
import * as schema from '@shared/schema';
import { eq, desc, and, asc } from 'drizzle-orm';

@Injectable()
export class BlogService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: DrizzleDB,
  ) {}

  async getAllPosts(includeUnpublished = false) {
    if (includeUnpublished) {
      return this.db.select().from(schema.blogPosts).orderBy(desc(schema.blogPosts.createdAt));
    }
    return this.db.select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.isPublished, true))
      .orderBy(desc(schema.blogPosts.publishedAt));
  }

  async getPostBySlug(slug: string) {
    const [post] = await this.db.select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug));
    
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getPostById(id: number) {
    const [post] = await this.db.select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.id, id));
    
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(data: any, authorId: number) {
    const [newPost] = await this.db.insert(schema.blogPosts).values({
      ...data,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.isPublished ? new Date() : null,
    } as any).returning();
    return newPost;
  }

  async updatePost(id: number, data: any) {
    const [existing] = await this.db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id));
    if (!existing) throw new NotFoundException('Post not found');

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If status changed to published and it wasn't published before, set publishedAt
    if (data.isPublished && !existing.isPublished) {
      updateData.publishedAt = new Date();
    }

    const [updated] = await this.db.update(schema.blogPosts)
      .set(updateData)
      .where(eq(schema.blogPosts.id, id))
      .returning();
    
    return updated;
  }

  async deletePost(id: number) {
    const [deleted] = await this.db.delete(schema.blogPosts)
      .where(eq(schema.blogPosts.id, id))
      .returning();
    
    if (!deleted) throw new NotFoundException('Post not found');
    return deleted;
  }
}

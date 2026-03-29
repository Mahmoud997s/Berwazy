import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { db } from '@/lib/db';
import { media, mediaFolders } from '@/shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import sharp from 'sharp';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

@Injectable()
export class MediaService {
  private readonly uploadDir = join(process.cwd(), 'public', 'uploads');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folderId?: number, altText?: string) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname).toLowerCase();
    const filename = `${uniqueSuffix}${extension}`;
    const filePath = join(this.uploadDir, filename);

    let finalFile = file.buffer;
    let metadata: any = {};

    // Image processing
    if (file.mimetype.startsWith('image/') && extension !== '.svg' && extension !== '.gif') {
      try {
        const image = sharp(file.buffer);
        const meta = await image.metadata();
        metadata = { width: meta.width, height: meta.height };

        // Always convert to webp if it's a standard image format for better compression
        if (['.jpg', '.jpeg', '.png'].includes(extension)) {
          finalFile = await image
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();
          
          // Update extension and filename to reflect conversion
          const baseName = uniqueSuffix;
          const newFilename = `${baseName}.webp`;
          const newFilePath = join(this.uploadDir, newFilename);
          
          writeFileSync(newFilePath, finalFile);
          
          // Save metadata to database with new webp info
          const [savedMedia] = await db.insert(media).values({
            filename: newFilename,
            originalName: file.originalname,
            mimeType: 'image/webp',
            size: finalFile.length,
            url: `/uploads/${newFilename}`,
            folderId: folderId || null,
            altText: altText || null,
            metadata: JSON.stringify(metadata),
          } as any).returning();

          return savedMedia;
        }
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    // Save non-image or non-converted files to filesystem
    try {
      writeFileSync(filePath, finalFile);
    } catch (err) {
      throw new InternalServerErrorException('Failed to save file');
    }

    // Save metadata to database
    const [savedMedia] = await db.insert(media).values({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: finalFile.length,
      url: `/uploads/${filename}`,
      folderId: folderId || null,
      altText: altText || null,
      metadata: JSON.stringify(metadata),
    } as any).returning();

    return savedMedia;
  }

  async getAllMedia(folderId?: number) {
    if (folderId) {
      return await db.select().from(media).where(eq(media.folderId, folderId));
    }
    return await db.select().from(media).where(isNull(media.folderId));
  }

  async deleteMedia(id: number) {
    const [item] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!item) return;

    const filePath = join(this.uploadDir, item.filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await db.delete(media).where(eq(media.id, id));
  }

  async createFolder(name: string, parentId?: number) {
    const [folder] = await db.insert(mediaFolders).values({
      name,
      parentId: parentId || null,
    } as any).returning();
    return folder;
  }

  async getFolders(parentId?: number) {
    if (parentId) {
      return await db.select().from(mediaFolders).where(eq(mediaFolders.parentId, parentId));
    }
    return await db.select().from(mediaFolders).where(isNull(mediaFolders.parentId));
  }

  async deleteFolder(id: number) {
    // Note: In a real system, you'd handle recursion or blocking if files exist
    await db.delete(mediaFolders).where(eq(mediaFolders.id, id));
  }
}

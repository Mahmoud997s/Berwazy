import 'dotenv/config';
import { Global, Module } from '@nestjs/common';
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

export const DB_CONNECTION = 'DB_CONNECTION';
export const POOL_CONNECTION = 'POOL_CONNECTION';
export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: POOL_CONNECTION,
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          throw new Error("DATABASE_URL must be set.");
        }
        const isNeon = process.env.DATABASE_URL.includes('neon.tech');
        return new pg.Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: isNeon ? { rejectUnauthorized: false } : false
        });
      },
    },
    {
      provide: DB_CONNECTION,
      useFactory: (pool: pg.Pool) => {
        return drizzle(pool, { schema });
      },
      inject: [POOL_CONNECTION],
    },
  ],
  exports: [DB_CONNECTION, POOL_CONNECTION],
})
export class DbModule {}

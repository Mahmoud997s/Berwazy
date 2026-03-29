import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';

import { POOL_CONNECTION } from "./db/db.module";
import connectPg from 'connect-pg-simple';

import { NestExpressApplication } from '@nestjs/platform-express';

import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Custom logger to debug session issues
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.includes('/api/v1/auth/me')) {
      console.log(`[Trace] ${req.method} ${req.url} - Cookie: ${req.headers.cookie ? 'Present' : 'NONE'}`);
    }
    next();
  });

  app.set('trust proxy', 1); // Trust the first proxy (Next.js)
  const pool = app.get(POOL_CONNECTION);
  const PostgresStore = connectPg(session);
  
  app.use(session({
    store: new PostgresStore({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'super-secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
      secure: false, // Set to false to allow HTTP for local testing
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // All our backend routes should be prefixed with /api/v1
  app.setGlobalPrefix('api/v1');
  
  // Enable CORS with credentials support
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();

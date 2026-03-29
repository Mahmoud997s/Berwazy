import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { POOL_CONNECTION } from "../src/db/db.module";
import connectPg from 'connect-pg-simple';

let cachedServer: any;

export default async (req: any, res: any) => {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new (require('@nestjs/platform-express').ExpressAdapter)(expressApp),
    );

    nestApp.set('trust proxy', 1);
    const pool = nestApp.get(POOL_CONNECTION);
    const PostgresStore = connectPg(session);

    nestApp.use(session({
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
        secure: true, // Always true on Vercel (HTTPS)
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }));

    nestApp.use(passport.initialize());
    nestApp.use(passport.session());
    nestApp.setGlobalPrefix('api/v1');
    nestApp.enableCors({
      origin: true,
      credentials: true,
    });

    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(req, res);
};

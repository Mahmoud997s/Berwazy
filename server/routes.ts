import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));

  const getSessionId = (req: Request) => {
    if (!req.session.id) {
      req.session.id = randomUUID();
    }
    return req.session.id;
  };

  app.get(api.collections.get.path, async (req, res) => {
    try {
      const slug = req.params.slug;
      const collection = await storage.getCollectionBySlug(slug);
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }

      let parsedParams = {};
      if (req.query) {
        const queryObj: any = { ...req.query };
        // Array values from query string may be strings or arrays. Normalise to array.
        ['orientation', 'color', 'size', 'material', 'onSale'].forEach(key => {
          if (queryObj[key]) {
            queryObj[key] = Array.isArray(queryObj[key]) ? queryObj[key] : [queryObj[key]];
          }
        });
        parsedParams = api.collections.get.input?.parse(queryObj) || {};
      }

      const result = await storage.getProductsByCollection(collection.id, parsedParams);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const productData = await storage.getProductBySlug(req.params.slug);
      if (!productData) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(productData);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.cart.get.path, async (req, res) => {
    try {
      const cart = await storage.getCart(getSessionId(req));
      res.json(cart);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post(api.cart.addItem.path, async (req, res) => {
    try {
      const input = api.cart.addItem.input.parse(req.body);
      const cart = await storage.addCartItem(getSessionId(req), input.variantId, input.qty);
      res.status(201).json(cart);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: e.message });
    }
  });

  app.patch(api.cart.updateItem.path, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const input = api.cart.updateItem.input.parse(req.body);
      const cart = await storage.updateCartItem(getSessionId(req), itemId, input.qty);
      res.json(cart);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: e.message });
    }
  });

  app.delete(api.cart.deleteItem.path, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.deleteCartItem(getSessionId(req), itemId);
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}

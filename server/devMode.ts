import type { Express, Request, Response, NextFunction } from "express";
import { generateDevToken } from "./supabaseAuth";

export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {

    return next();
  }


  if (req.path === '/api/auth/dev-available') {
    return res.json({ available: true });
  }

  if (req.path === '/api/auth/dev-login' && req.method === 'POST') {
    const token = generateDevToken();
    const payloadBase64 = token.split('-').pop() || '';
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    return res.json({
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      accessToken: token
    });
  }

  return next();
};

export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  return next();
};


// Extensão dos tipos para a sessão Express
import 'express-session';
import { User } from './schema';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    passport?: any;
    devUserId?: string;
    devIsAuthenticated?: boolean;
  }
}

declare global {
  namespace Express {
    interface User {
      claims?: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
        exp?: number;
        [key: string]: any;
      };
      dbUserId?: string;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}
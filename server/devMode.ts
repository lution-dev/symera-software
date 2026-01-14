import type { Request, Response, NextFunction } from "express";

export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  return next();
};

export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  return next();
};

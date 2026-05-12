import { authConfig } from "../config/auth";
import { AppError } from "../utils/AppError";

import { Request, Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";

interface TokenPayLoad {
  role: string;
  sub: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("JWT token not found");
    }

    const [, token] = authHeader.split(" ");

    const { role, sub: user_id } = jwt.verify(
      token,
      authConfig.jwt.secret,
    ) as TokenPayLoad;

    req.user = {
      id: user_id,
      role,
    };

    return next();
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }
}

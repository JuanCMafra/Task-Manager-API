import { AppError } from "@/utils/AppError";
import { NextFunction, Response, Request } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "validation error",
      issues: err.issues,
    });
  }

  console.log(err);
  

  return res.status(500).json({ message: err.message });
}

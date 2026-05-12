import { authConfig } from "../config/auth";
import { AppError } from "../utils/AppError";
import { compare } from "bcrypt";
import { Request, Response, NextFunction } from "express";
import jwt  from "jsonwebtoken";
import z from "zod";
import prisma from "../database/prisma";

class SessionsController {
  async create(req: Request, res: Response, next: NextFunction) {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return next(new AppError("invalid e-mail or password!", 401));
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      return next(new AppError("invalid e-mail or password!", 401));
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({ role: user.role ?? "member" }, secret, {
      subject: String(user.id),
      expiresIn: expiresIn,
    });

    const { password: hashedPassword, ...userWithoutPassword } = user;

    return res.status(201).json({ token, user: userWithoutPassword });
  }
}

export { SessionsController };

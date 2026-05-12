import { NextFunction, Request, Response } from "express";
import z from "zod";
import prisma from "../database/prisma";
import { AppError } from "../utils/AppError";

import { hash } from "bcrypt";

export class UsersController {
  async create(req: Request, res: Response, next: NextFunction) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

    if (userWithSameEmail) {
      return next(new AppError("user with same email already exists"))
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  }
}

import prisma from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class TeamsController {
  async create(req: Request, res: Response, next: NextFunction) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      description: z
        .union([z.string().trim().min(6), z.literal("")])
        .optional(),
    });

    const { name, description } = bodySchema.parse(req.body);

    const teamWithSameName = await prisma.teams.findFirst({
      where: { name },
    });

    if (teamWithSameName) {
      return next(new AppError("team with same name already exists"));
    }

    const team = await prisma.teams.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({ team });
  }

  async show(req: Request, res: Response, next: NextFunction) {
    const teams = await prisma.teams.findMany();

    const formattedTeams = teams.map((team) => ({
      team_id: team.id,
      name: team.name,
      description: team.description,
    }))

    return res.json(formattedTeams);
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      description: z
        .union([z.string().trim().min(6), z.literal("")])
        .optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const { name, description } = bodySchema.parse(req.body);

    await prisma.teams.update({
      data: {
        name,
        description,
      },
      where: {
        id,
      },
    });

    return res.json({ id, name, description });
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    const deletedTeam = await prisma.teams.findFirst({ where: { id } });

    if (!deletedTeam) {
      return next(new AppError("Team not found", 404));
    }

    await prisma.teams.delete({
      where: { id },
    });

    return res.json({ message: "The team was removed!" });
  }
}

export { TeamsController };

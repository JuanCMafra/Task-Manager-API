import prisma from "../database/prisma";
import { AppError } from "../utils/AppError";

import { Request, Response, NextFunction } from "express";
import z from "zod";

export async function ensureTaskPermission(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role === "admin") {
    return next();
  }

  let teamId: string;

  const taskIdParams = req.params?.task_id;
  const teamBodyId = req.body?.team_id;

  if (taskIdParams) {
    const paramsSchema = z.object({
      task_id: z.uuid(),
    });

    const { task_id } = paramsSchema.parse(req.params);

    const task = await prisma.tasks.findUnique({
      where: {
        id: task_id,
      }
    });    

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    teamId = task.teamId;

  } else if (teamBodyId) {
    const bodySchema = z.object({
      team_id: z.uuid(),
    });

    const { team_id } = bodySchema.parse(req.body);

    const team = await prisma.teams.findFirst({
      where: {
        id: team_id,
      },
    });

    if (!team) {
      return next(new AppError("Team not found", 404));
    }

    teamId = team_id;

  } else {
    return next(new AppError("Team not identified"));
  }

  const userBelongsToTeam = await prisma.teamMembers.findFirst({
    where: { teamId: teamId, userId: req.user?.id },
  });

  if (!userBelongsToTeam) {
    return next(new AppError("You may only access tasks of your team", 403));
  }

  return next();
}

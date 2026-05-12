import prisma from "../database/prisma";
import { AppError } from "../utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class TaskAssignerController {
  async assign(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      task_id: z.uuid(),
    });

    const { task_id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      assigned_to: z.uuid(),
    });

    const { assigned_to } = bodySchema.parse(req.body);

    const verifyUserBelongsToTeam = await prisma.tasks.findFirst({
      where: {
        id: task_id,
        team: { members: { some: { userId: assigned_to } } },
      },
    });

    if (!verifyUserBelongsToTeam) {
      return next(
        new AppError("Member must be in the task's team to assign", 403),
      );
    }

    await prisma.tasks.update({
      data: { assignedTo: assigned_to },
      where: { id: task_id },
    });

    return res.json({ message: "Task assigned!" });
  }
}

export { TaskAssignerController };

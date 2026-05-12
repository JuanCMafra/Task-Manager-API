import prisma from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z, { includes } from "zod";

class TasksController {
  async create(req: Request, res: Response, next: NextFunction) {
    const bodySchema = z.object({
      title: z.string().trim().min(2),
      description: z
        .union([z.string().trim().min(6), z.literal("")])
        .optional(),
      status: z.enum(["pending", "in_progress"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      responsible: z.uuid(),
      team_id: z.uuid(),
    });

    const { title, description, status, priority, responsible, team_id } =
      bodySchema.parse(req.body);

    const responsibleBelongsToTeam = await prisma.teamMembers.findFirst({
      where: { teamId: team_id, userId: responsible },
    });

    if (!responsibleBelongsToTeam) {
      return next(new AppError("Add member to this team before"));
    }

    await prisma.tasks.create({
      data: {
        title,
        description,
        status,
        priority,
        assignedTo: responsible,
        teamId: team_id,
      },
    });

    const findId = await prisma.tasks.findFirst({
      where: {
        title,
        description,
        status,
        priority,
        assignedTo: responsible,
        teamId: team_id,
      },
    });
    return res.status(201).json({id: findId?.id});
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      task_id: z.uuid(),
    });

    const { task_id } = paramsSchema.parse(req.params);

    const bodySchema = z
      .object({
        title: z.string().trim().min(2).optional(),
        description: z
          .union([z.string().trim().min(6), z.literal("")])
          .optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        responsible: z.uuid().optional(),
        team_id: z.uuid().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: "Please provide at least one field to update",
      });

    const taskSelected = await prisma.tasks.findFirst({
      where: { id: task_id },
    });

    if (!taskSelected) {
      return next(new AppError("Task not found", 404));
    }

    const { title, description, status, priority, responsible, team_id } =
      bodySchema.parse(req.body);

    if (req.body.responsible) {
      const responsibleSelected = await prisma.user.findUnique({
        where: { id: responsible },
      });

      if (!responsibleSelected) {
        return next(new AppError("member not found", 404));
      }
    }

    const oldStatus = taskSelected.status;

    await prisma.tasks.update({
      data: {
        title,
        description,
        status,
        priority,
        assignedTo: responsible,
        teamId: team_id,
      },
      where: {
        id: task_id,
      },
    });

    if (status !== undefined && req.body.status !== oldStatus) {
      await prisma.tasksHistory.create({
        data: {
          taskId: task_id,
          changedBy: req.user!.id,
          oldStatus: oldStatus,
          newStatus: status,
        },
      });
    }

    return res.json("Task updated!");
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      task_id: z.uuid(),
    });

    const { task_id } = paramsSchema.parse(req.params);

    await prisma.tasks.delete({
      where: { id: task_id },
    });

    return res.json("Task was removed!");
  }
}

export { TasksController };

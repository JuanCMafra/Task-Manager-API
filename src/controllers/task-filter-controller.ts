import prisma from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class TaskFilterController {
  async filter(req: Request, res: Response, next: NextFunction) {
    const querySchema = z.object({
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      team: z.string().trim().optional(),
      responsible: z.string().trim().optional(),
    });

    const { status, priority, team, responsible } = querySchema.parse(
      req.query,
    );

    const tasks = await prisma.tasks.findMany({
      where: {
        status,
        priority,
        team: {
          name: { contains: team, mode: "insensitive" },
          ...(req.user?.role === "member"
            ? {
                members: {
                  some: {
                    userId: req.user.id,
                  },
                },
              }
            : {}),
        },
        creator: { name: { contains: responsible, mode: "insensitive" } },
      },

      include: {
        creator: { select: { name: true } },
        team: { select: { name: true } },
      },
    });

    const showTasks = tasks.map((task) => ({
      task_id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      responsible: task.creator.name,
      team: task.team.name,
    }));

    if (showTasks.length === 0) {
      return next(
        new AppError("You don't have tasks for the filter selected", 404),
      );
    }

    return res.json(showTasks);
  }
}

export { TaskFilterController };

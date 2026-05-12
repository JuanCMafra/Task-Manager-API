import prisma from "../database/prisma";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class TaskHistoryController {
  async show(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      task_id: z.uuid(),
    });

    const { task_id } = paramsSchema.parse(req.params);

    const taskHistory = await prisma.tasksHistory.findMany({
      where: { taskId: task_id },
      include: {
        user: { select: { name: true } },
        task: { select: { title: true } },
      },
    });

    const showHistory = taskHistory.map((task) => ({
      task_id: task.taskId,
      changed_by: task.user.name,
      old_status: task.oldStatus,
      new_status: task.newStatus,
      changed_at: task.changedAt
    }));

    return res.json(showHistory);
  }
}

export { TaskHistoryController };

import { TaskAssignerController } from "@/controllers/task-assigner-controller";
import { TaskFilterController } from "@/controllers/task-filter-controller";
import { TaskHistoryController } from "@/controllers/task-history-controller";
import { TasksController } from "@/controllers/tasks-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { ensureTaskPermission } from "@/middlewares/ensure-task-permission";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";
import { Router } from "express";

const tasksRoutes = Router();
const tasksController = new TasksController();
const taskFilterController = new TaskFilterController();
const taskAssignerController = new TaskAssignerController();
const taskHistoryController = new TaskHistoryController

tasksRoutes.use(
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "member"]),
);

tasksRoutes.post("/", ensureTaskPermission, (req, res, next) =>
  tasksController.create(req, res, next),
);

tasksRoutes.patch("/:task_id/update", ensureTaskPermission, (req, res, next) =>
  tasksController.update(req, res, next),
);
tasksRoutes.patch("/:task_id/assign", ensureTaskPermission, (req, res, next) =>
  taskAssignerController.assign(req, res, next),
);

tasksRoutes.delete("/:task_id/remove", ensureTaskPermission, (req, res, next) =>
  tasksController.remove(req, res, next),
);

tasksRoutes.get("/list", (req, res, next) =>
  taskFilterController.filter(req, res, next),
);

tasksRoutes.get("/:task_id/history", ensureTaskPermission, (req, res, next) =>
  taskHistoryController.show(req, res, next),
);

export { tasksRoutes };

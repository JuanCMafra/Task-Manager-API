import { TeamsController } from "@/controllers/teams-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";
import { Router } from "express";

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]));

teamsRoutes.post("/", (req, res, next) =>
  teamsController.create(req, res, next),
);

teamsRoutes.get("/", (req, res, next) => teamsController.show(req, res, next));

teamsRoutes.patch("/:id/update", (req, res, next) => teamsController.update(req, res, next))

teamsRoutes.delete("/:id/remove", (req, res, next) => teamsController.remove(req, res, next))

export { teamsRoutes };

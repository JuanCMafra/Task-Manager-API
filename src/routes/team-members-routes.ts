import { TeamMembersController } from "@/controllers/team-members-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";
import { Router } from "express";

const teamMembersRoutes = Router();
const teamMembersController = new TeamMembersController();

teamMembersRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["admin"]),
  (req, res, next) => teamMembersController.create(req, res, next),
);

teamMembersRoutes.delete(
  "/:team_id/remove",
  ensureAuthenticated,
  verifyUserAuthorization(["admin"]),
  (req, res, next) => teamMembersController.remove(req, res, next),
);

teamMembersRoutes.get(
  "/:team_id/show",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "member"]),
  (req, res, next) => teamMembersController.show(req, res, next),
);

export { teamMembersRoutes };

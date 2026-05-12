import { UsersController } from "../controllers/users-controller";
import { Router } from "express";

const userRoutes = Router();
const userController = new UsersController();

userRoutes.post("/", (req, res, next) => userController.create(req, res, next));

export { userRoutes };

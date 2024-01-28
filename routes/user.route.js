import { Router } from "express";
import usersController from "../controllers/user.controller.js";

const router = Router();

router.post("/auth", usersController.registUser);
router.post("/login", usersController.login);
router.get("/user", usersController.getUser);
router.delete("/user/:id", usersController.deleteUser);

export default router;

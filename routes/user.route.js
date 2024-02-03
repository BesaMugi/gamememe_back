import { Router } from "express";
import usersController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();


router.post("/auth", usersController.registUser);
router.post("/login", usersController.login);
router.delete("/user/:id", usersController.deleteUser);
router.get("/profile", authMiddleware, usersController.getUserProfile);
router.put("/users/:id/inventory", authMiddleware, usersController.updateInventory);
router.patch("/users/:id/updateEnergy", authMiddleware, usersController.updateUserEnergy);
router.patch("/users/:id/eatItem", authMiddleware, usersController.eatItem);
router.patch("/users/:id/update-wallet", usersController.updateWallet);

export default router;

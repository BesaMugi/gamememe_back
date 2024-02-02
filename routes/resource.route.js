import { Router } from "express";
import resourcesController from "../controllers/resource.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = Router();

router.get("/resources", authMiddleware, resourcesController.getResources);
router.patch("/users/:id/sellResource", authMiddleware, resourcesController.sellResource);
router.patch("/resources/update-price", authMiddleware, resourcesController.updateResourcePrice);


export default router;

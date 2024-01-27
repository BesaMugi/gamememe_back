import { Router } from "express";
import resourcesController from "../controllers/resource.controller.js";

const router = Router();

router.post("/resources", resourcesController.addResource);
router.get("/resources", resourcesController.getResources);
router.delete("/resources/:name", resourcesController.removeResource);

export default router;


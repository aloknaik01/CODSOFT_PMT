import { Router } from "express";
import { getStats, getActivityFeed } from "../controllers/dashboard.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/activity", getActivityFeed);

export default router;

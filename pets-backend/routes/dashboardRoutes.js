import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getDashboard, saveDashboard } from "../controller/dashboardController.js";

const router = Router();
router.use(requireAuth);
router.get("/", getDashboard);
router.put("/", saveDashboard);
export default router;

import { Router } from "express";
import { getDailyChecklist } from "../controllers/mealRecordController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getDailyChecklist);

export default router;
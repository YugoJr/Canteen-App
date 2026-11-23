import { Router } from "express";
import {
  getMealRecords,
  tickMeal,
  untickMeal,
} from "../controllers/mealRecordController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMealRecords);
router.post("/", tickMeal);
router.delete("/:id", untickMeal);

export default router;
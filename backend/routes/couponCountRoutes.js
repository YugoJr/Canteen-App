import { Router } from "express";
import {
  getCouponCounts,
  getCouponCount,
  saveCouponCount,
  removeCouponCount,
} from "../controllers/couponCountController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCouponCounts);
router.get("/:date", getCouponCount);
router.put("/:date", saveCouponCount);
router.delete("/:date", removeCouponCount);

export default router;
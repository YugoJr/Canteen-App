import { Router } from "express";
import {
  addWorker,
  getWorkers,
  getWorker,
  editWorker,
  removeWorker,
} from "../controllers/workerController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getWorkers);
router.post("/", addWorker);
router.get("/:id", getWorker);
router.put("/:id", editWorker);
router.delete("/:id", removeWorker);

export default router;
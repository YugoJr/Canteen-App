import { Router } from 'express';
import { addWorker, getWorkers } from '../controllers/workerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate); // Apply authentication middleware to all routes

router.get('/', getWorkers);
router.post('/', addWorker);

export default router;
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateCreateWorker,
  validateListWorkers,
} from "../validators/workerValidator.js";
import { createWorker, listWorkers } from "../services/workerService.js";

export const addWorker = asyncHandler(async (req, res) => {
  const data = validateCreateWorker(req.body);
  const worker = await createWorker(data);

  res.status(201).json(worker);
});

export const getWorkers = asyncHandler(async (req, res) => {
  const filters = validateListWorkers(req.query);
  const workers = await listWorkers(filters);

  res.status(200).json(workers);
});
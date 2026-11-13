import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateId,
  validateCreateWorker,
  validateListWorkers,
  validateUpdateWorker,
} from "../validators/workerValidator.js";
import {
  createWorker,
  listWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
} from "../services/workerService.js";

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

export const getWorker = asyncHandler(async (req, res) => {
  const id = validateId(req.params.id);
  const worker = await getWorkerById(id);

  res.status(200).json(worker);
});

export const editWorker = asyncHandler(async (req, res) => {
  const id = validateId(req.params.id);
  const changes = validateUpdateWorker(req.body);
  const worker = await updateWorker(id, changes);

  res.status(200).json(worker);
});

export const removeWorker = asyncHandler(async (req, res) => {
  const id = validateId(req.params.id);
  await deleteWorker(id);

  res.status(200).json({ message: "Worker deleted." });
});
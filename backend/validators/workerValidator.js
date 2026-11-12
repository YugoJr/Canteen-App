import { AppError } from "../utils/AppError.js";

const WORKER_TYPES = ["dorm", "non_dorm", "dorm_outside_province"];

export function validateCreateWorker(body) {
  const { name, worker_type } = body || {};

  if (typeof name !== "string" || name.trim() === "") {
    throw new AppError("Name is required.", 400);
  }
  if (name.trim().length > 100) {
    throw new AppError("Name must be 100 characters or fewer.", 400);
  }
  if (!WORKER_TYPES.includes(worker_type)) {
    throw new AppError(
      `worker_type must be one of: ${WORKER_TYPES.join(", ")}.`,
      400
    );
  }

  return { name: name.trim(), workerType: worker_type };
}

export function validateListWorkers(query) {
  const { type } = query || {};

  if (type !== undefined && !WORKER_TYPES.includes(type)) {
    throw new AppError(
      `type must be one of: ${WORKER_TYPES.join(", ")}.`,
      400
    );
  }

  return { type };
}
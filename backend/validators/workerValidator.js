import { AppError } from "../utils/AppError.js";

const WORKER_TYPES = ["dorm", "non_dorm", "dorm_outside_province"];
const TYPE_MESSAGE = `must be one of: ${WORKER_TYPES.join(", ")}.`;

function cleanName(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new AppError("Name is required.", 400);
  }
  if (name.trim().length > 100) {
    throw new AppError("Name must be 100 characters or fewer.", 400);
  }
  return name.trim();
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError("Invalid worker id.", 400);
  }
  return id;
}

export function validateCreateWorker(body) {
  const { name, worker_type } = body || {};

  const cleanedName = cleanName(name);
  if (!WORKER_TYPES.includes(worker_type)) {
    throw new AppError(`worker_type ${TYPE_MESSAGE}`, 400);
  }

  return { name: cleanedName, workerType: worker_type };
}

export function validateListWorkers(query) {
  const { type } = query || {};

  if (type !== undefined && !WORKER_TYPES.includes(type)) {
    throw new AppError(`type ${TYPE_MESSAGE}`, 400);
  }

  return { type };
}

export function validateUpdateWorker(body) {
  const { name, worker_type, left_date } = body || {};
  const changes = {};

  if (name !== undefined) {
    changes.name = cleanName(name);
  }
  if (worker_type !== undefined) {
    if (!WORKER_TYPES.includes(worker_type)) {
      throw new AppError(`worker_type ${TYPE_MESSAGE}`, 400);
    }
    changes.workerType = worker_type;
  }
  if (left_date !== undefined) {
    if (left_date !== null && !isRealDate(left_date)) {
      throw new AppError("left_date must be a date like 2026-11-30, or null.", 400);
    }
    changes.leftDate = left_date;
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError(
      "Send at least one field to update: name, worker_type, or left_date.",
      400
    );
  }

  return changes;
}
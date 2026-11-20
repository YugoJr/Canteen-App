import { AppError } from "../utils/AppError.js";
import { isRealDate, todayString } from "../utils/dateUtils.js";

const MEAL_SLOTS = ["morning", "afternoon", "evening"];

export function validateRecordId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError("Invalid meal record id.", 400);
  }
  return id;
}

export function validateCreateMealRecord(body) {
  const { worker_id, meal_date, meal_slot } = body || {};

  if (!Number.isInteger(worker_id) || worker_id < 1) {
    throw new AppError("worker_id must be a positive whole number.", 400);
  }
  if (!isRealDate(meal_date)) {
    throw new AppError("meal_date must be a date like 2026-11-30.", 400);
  }
  if (meal_date > todayString()) {
    throw new AppError("meal_date cannot be in the future.", 400);
  }
  if (!MEAL_SLOTS.includes(meal_slot)) {
    throw new AppError(`meal_slot must be one of: ${MEAL_SLOTS.join(", ")}.`, 400);
  }

  return { workerId: worker_id, mealDate: meal_date, mealSlot: meal_slot };
}


export function validateChecklistQuery(query) {
  const { date } = query || {};

  if (date === undefined) {
    return { date: todayString() };
  }
  if (!isRealDate(date)) {
    throw new AppError("date must be a date like 2026-11-30.", 400);
  }
  if (date > todayString()) {
    throw new AppError("date cannot be in the future.", 400);
  }

  return { date };
}
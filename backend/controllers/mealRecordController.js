import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateRecordId,
  validateCreateMealRecord,
} from "../validators/mealRecordValidator.js";
import {
  createMealRecord,
  deleteMealRecord,
} from "../services/mealRecordService.js";

export const tickMeal = asyncHandler(async (req, res) => {
  const data = validateCreateMealRecord(req.body);
  const record = await createMealRecord(data);

  res.status(201).json(record);
});

export const untickMeal = asyncHandler(async (req, res) => {
  const id = validateRecordId(req.params.id);
  await deleteMealRecord(id);

  res.status(200).json({ message: "Meal record deleted." });
});
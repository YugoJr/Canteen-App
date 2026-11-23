import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateRecordId,
  validateCreateMealRecord,
  validateChecklistQuery,
  validateListMealRecords,
} from "../validators/mealRecordValidator.js";
import {
  createMealRecord,
  deleteMealRecord,
  getChecklist,
  listMealRecords,
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

export const getDailyChecklist = asyncHandler(async (req, res) => {
  const { date } = validateChecklistQuery(req.query);
  const checklist = await getChecklist(date);

  res.status(200).json(checklist);
});

export const getMealRecords = asyncHandler(async (req, res) => {
  const filters = validateListMealRecords(req.query);
  const result = await listMealRecords(filters);

  res.status(200).json(result);
});

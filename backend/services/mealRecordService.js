import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { getWorkerById } from "./workerService.js";

const ALLOWED_SLOTS = {
  dorm: ["morning", "evening"],
  non_dorm: [],
  dorm_outside_province: ["morning", "afternoon", "evening"],
};

const COLUMNS = "id, worker_id, meal_date, meal_slot, worker_type, created_at";

export async function createMealRecord({ workerId, mealDate, mealSlot }) {
  const worker = await getWorkerById(workerId);
  const allowed = ALLOWED_SLOTS[worker.worker_type];

  if (allowed.length === 0) {
    throw new AppError(
      "Non-dorm workers are not ticked by name. Their coupons are counted.",
      400
    );
  }
  if (!allowed.includes(mealSlot)) {
    throw new AppError(
      `Workers of type ${worker.worker_type} can only be ticked by name for: ${allowed.join(", ")}.`,
      400
    );
  }
  if (worker.left_date && mealDate > worker.left_date) {
    throw new AppError("The meal date is after the worker's left date.", 400);
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO meal_records (worker_id, meal_date, meal_slot, worker_type) VALUES (?, ?, ?, ?)",
      [workerId, mealDate, mealSlot, worker.worker_type]
    );

    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM meal_records WHERE id = ?`,
      [result.insertId]
    );
    return rows[0];
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError("This meal is already ticked for that worker.", 409);
    }
    throw error;
  }
}

export async function deleteMealRecord(id) {
  const [result] = await pool.query(
    "DELETE FROM meal_records WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    throw new AppError("Meal record not found.", 404);
  }
}
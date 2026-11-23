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

export async function getChecklist(date) {
  const [workers] = await pool.query(
    `SELECT id, name, worker_type FROM workers
     WHERE worker_type IN ('dorm', 'dorm_outside_province')
       AND (left_date IS NULL OR left_date >= ?)
     ORDER BY name`,
    [date]
  );

  const [records] = await pool.query(
    "SELECT id, worker_id, meal_slot FROM meal_records WHERE meal_date = ?",
    [date]
  );

  const ticksByWorker = new Map();
  for (const record of records) {
    if (!ticksByWorker.has(record.worker_id)) {
      ticksByWorker.set(record.worker_id, []);
    }
    ticksByWorker
      .get(record.worker_id)
      .push({ id: record.id, meal_slot: record.meal_slot });
  }

  return {
    date,
    workers: workers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      worker_type: worker.worker_type,
      allowed_slots: ALLOWED_SLOTS[worker.worker_type],
      ticks: ticksByWorker.get(worker.id) || [],
    })),
  };
}

export async function listMealRecords({ month, page, limit, workerId, mealSlot }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end =
    monthNumber === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthNumber + 1).padStart(2, "0")}-01`;

  const conditions = ["mr.meal_date >= ?", "mr.meal_date < ?"];
  const params = [start, end];

  if (workerId !== undefined) {
    conditions.push("mr.worker_id = ?");
    params.push(workerId);
  }
  if (mealSlot !== undefined) {
    conditions.push("mr.meal_slot = ?");
    params.push(mealSlot);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM meal_records mr WHERE ${where}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT mr.id, mr.worker_id, w.name AS worker_name, mr.meal_date,
            mr.meal_slot, mr.worker_type, mr.created_at
     FROM meal_records mr
     JOIN workers w ON w.id = mr.worker_id
     WHERE ${where}
     ORDER BY mr.meal_date DESC, mr.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
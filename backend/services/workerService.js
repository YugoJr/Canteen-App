import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const COLUMNS = "id, name, worker_type, left_date, created_at";

export async function createWorker({ name, workerType }) {
  const [result] = await pool.query(
    "INSERT INTO workers (name, worker_type) VALUES (?, ?)",
    [name, workerType]
  );

  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM workers WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

export async function listWorkers({ type }) {
  let sql = `SELECT ${COLUMNS} FROM workers
             WHERE (left_date IS NULL
                    OR left_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01'))`;
  const params = [];

  if (type) {
    sql += " AND worker_type = ?";
    params.push(type);
  }

  sql += " ORDER BY name";

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getWorkerById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM workers WHERE id = ?`,
    [id]
  );
  const worker = rows[0];

  if (!worker) {
    throw new AppError("Worker not found.", 404);
  }

  return worker;
}

export async function updateWorker(id, changes) {
  await getWorkerById(id);

  const assignments = [];
  const params = [];

  if (changes.name !== undefined) {
    assignments.push("name = ?");
    params.push(changes.name);
  }
  if (changes.workerType !== undefined) {
    assignments.push("worker_type = ?");
    params.push(changes.workerType);
  }
  if (changes.leftDate !== undefined) {
    assignments.push("left_date = ?");
    params.push(changes.leftDate);
  }

  await pool.query(
    `UPDATE workers SET ${assignments.join(", ")} WHERE id = ?`,
    [...params, id]
  );

  return getWorkerById(id);
}

export async function deleteWorker(id) {
  try {
    const [result] = await pool.query("DELETE FROM workers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      throw new AppError("Worker not found.", 404);
    }
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new AppError(
        "This worker has meal records. Set a left date instead.",
        409
      );
    }
    throw error;
  }
}
import pool from "../config/db.js";

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
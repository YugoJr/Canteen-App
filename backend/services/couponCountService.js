import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { monthRange } from "../utils/dateUtils.js";

const COLUMNS = "id, count_date, coupon_count, created_at";

export async function listCounts(month) {
  const { start, end } = monthRange(month);

  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM daily_coupon_counts
     WHERE count_date >= ? AND count_date < ?
     ORDER BY count_date`,
    [start, end]
  );

  return rows;
}

export async function getCount(date) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM daily_coupon_counts WHERE count_date = ?`,
    [date]
  );

  if (!rows[0]) {
    throw new AppError("No coupon count entered for that date.", 404);
  }

  return rows[0];
}

export async function saveCount({ date, couponCount }) {
  const [existing] = await pool.query(
    "SELECT id FROM daily_coupon_counts WHERE count_date = ?",
    [date]
  );
  const created = existing.length === 0;

  await pool.query(
    `INSERT INTO daily_coupon_counts (count_date, coupon_count)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE coupon_count = VALUES(coupon_count)`,
    [date, couponCount]
  );

  const count = await getCount(date);
  return { created, count };
}

export async function deleteCount(date) {
  const [result] = await pool.query(
    "DELETE FROM daily_coupon_counts WHERE count_date = ?",
    [date]
  );

  if (result.affectedRows === 0) {
    throw new AppError("No coupon count entered for that date.", 404);
  }
}
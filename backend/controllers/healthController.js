import pool from "../config/db.js";

export async function getHealth(req, res) {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "unreachable" });
  }
}
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function registerUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    return { id: result.insertId, name, email };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError("This email is already registered.", 409);
    }
    throw error;
  }
}
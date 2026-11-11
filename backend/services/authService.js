import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

export async function loginUser({ email, password }) {
  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  const user = rows[0];

  const passwordMatches = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email FROM users WHERE id = ?",
    [id]
  );
  const user = rows[0];

  if (!user) {
    throw new AppError("Account no longer exists.", 401);
  }

  return user;
}
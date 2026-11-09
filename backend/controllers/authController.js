import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { validateRegister } from "../validators/authValidator.js";

export async function register(req, res) {
  try {
    const { name, email, password } = validateRegister(req.body);

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This email is already registered." });
    }
    console.error(error);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password === ""
  ) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    const user = rows[0];

    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
}
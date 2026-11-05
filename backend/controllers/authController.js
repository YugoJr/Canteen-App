import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
    const { name, email, password } = req.body || {};

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ message: "Name is Required." });
    }
    if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
        return res.status(400).json({ message: "Valid email is Required." });
    }
    if (typeof password !== "string" || password.length < 8) {
        return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [cleanName, cleanEmail, passwordHash]
        );

        res.status(201).json({ id: result.insertId, name: cleanName, email: cleanEmail });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email already exists." });
        }
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
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
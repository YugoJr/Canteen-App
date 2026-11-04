import bcrypt from "bcrypt";
import pool from "../config/db.js";

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
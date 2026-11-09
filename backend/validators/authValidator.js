import { AppError } from "../utils/AppError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(body) {
  const { name, email, password } = body || {};

  if (typeof name !== "string" || name.trim() === "") {
    throw new AppError("Name is required.", 400);
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError("A valid email is required.", 400);
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
}
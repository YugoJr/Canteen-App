import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required.", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
  } catch (error) {
    throw new AppError("Invalid or expired token.", 401);
  }

  next();
}
import { AppError } from "../utils/AppError.js";

export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
}
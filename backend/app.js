import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import mealRecordRoutes from "./routes/mealRecordRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checklistRoutes from "./routes/checklistRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import workerRoutes from "./routes/workerRoutes.js";
import couponCountRoutes from "./routes/couponCountRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/meal-records", mealRecordRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/coupon-counts", couponCountRoutes);


app.use(errorHandler);

export default app;
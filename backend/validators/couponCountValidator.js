import { AppError } from "../utils/AppError.js";
import { isRealDate, todayString, MONTH_PATTERN } from "../utils/dateUtils.js";

export function validateDateParam(value) {
  if (!isRealDate(value)) {
    throw new AppError("date must be a date like 2026-11-30.", 400);
  }
  return value;
}

export function validateListCounts(query) {
  const { month } = query || {};
  const cleanMonth = month === undefined ? todayString().slice(0, 7) : month;

  if (typeof cleanMonth !== "string" || !MONTH_PATTERN.test(cleanMonth)) {
    throw new AppError("month must look like 2026-11.", 400);
  }

  return { month: cleanMonth };
}

export function validateSaveCount(date, body) {
  validateDateParam(date);
  if (date > todayString()) {
    throw new AppError("date cannot be in the future.", 400);
  }

  const { coupon_count } = body || {};
  if (!Number.isInteger(coupon_count) || coupon_count < 0) {
    throw new AppError("coupon_count must be a whole number, zero or more.", 400);
  }

  return { date, couponCount: coupon_count };
}
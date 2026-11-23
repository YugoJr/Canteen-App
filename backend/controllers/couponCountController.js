import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateDateParam,
  validateListCounts,
  validateSaveCount,
} from "../validators/couponCountValidator.js";
import {
  listCounts,
  getCount,
  saveCount,
  deleteCount,
} from "../services/couponCountService.js";

export const getCouponCounts = asyncHandler(async (req, res) => {
  const { month } = validateListCounts(req.query);
  const counts = await listCounts(month);

  res.status(200).json(counts);
});

export const getCouponCount = asyncHandler(async (req, res) => {
  const date = validateDateParam(req.params.date);
  const count = await getCount(date);

  res.status(200).json(count);
});

export const saveCouponCount = asyncHandler(async (req, res) => {
  const input = validateSaveCount(req.params.date, req.body);
  const { created, count } = await saveCount(input);

  res.status(created ? 201 : 200).json(count);
});

export const removeCouponCount = asyncHandler(async (req, res) => {
  const date = validateDateParam(req.params.date);
  await deleteCount(date);

  res.status(200).json({ message: "Coupon count deleted." });
});
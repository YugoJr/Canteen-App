import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRegister, validateLogin } from "../validators/authValidator.js";
import { registerUser, loginUser, getUserById } from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const data = validateRegister(req.body);
  const user = await registerUser(data);

  res.status(201).json(user);
});

export const login = asyncHandler(async (req, res) => {
  const data = validateLogin(req.body);
  const result = await loginUser(data);

  res.status(200).json(result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json(user);
});
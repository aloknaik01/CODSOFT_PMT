import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
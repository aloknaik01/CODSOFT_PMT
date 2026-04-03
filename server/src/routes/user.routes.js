import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  searchUsers,
} from "../controllers/user.controller.js";
import protect from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

// protect all routes
router.use(protect);

// profile routes
router
  .route("/profile")
  .get(getProfile)
  .patch(validate(updateProfileSchema), updateProfile);

// avatar route
router.patch("/profile/avatar", updateAvatar);

// search route
router.get("/users/search", searchUsers);

export default router;
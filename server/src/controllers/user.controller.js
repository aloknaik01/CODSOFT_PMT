import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import userService from "../services/user.service.js";

// Get profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched", user));
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await userService.updateProfile(req.user.id, {
    name,
    email,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated", user));
});

// Update avatar
export const updateAvatar = asyncHandler(async (req, res) => {
  const file = req.files?.avatar;

  if (!file) {
    throw new ApiError(400, "Please upload an image file");
  }

  // file type validation
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(400, "Only JPG, PNG, WEBP allowed");
  }

  // file size validation (2MB)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new ApiError(400, "File size must be less than 2MB");
  }

  const user = await userService.updateAvatar(req.user.id, file);

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated", user));
});

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();

  if (!q || q.length < 2) {
    throw new ApiError(400, "Search term must be at least 2 characters");
  }

  const users = await userService.searchUsers(q, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Users found", users));
});
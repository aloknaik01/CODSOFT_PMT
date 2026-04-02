import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import authService from "../services/auth.service.js";

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// Register
export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(201, "Account created successfully", { user }));
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, "Login successful", { user }));
});

// Get Me
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, "User fetched", user));
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully", null));
});
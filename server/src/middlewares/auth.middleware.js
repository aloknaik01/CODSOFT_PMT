import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { query } from "../config/db.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token safely
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "No token provided. Please login");
  }


  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  // Check user still exists
  const result = await query(
    "SELECT id, name, email, avatar_url FROM users WHERE id = $1",
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "User no longer exists");
  }

  // Attach user ti req
  req.user = result.rows[0];
  next();
});

export default protect;
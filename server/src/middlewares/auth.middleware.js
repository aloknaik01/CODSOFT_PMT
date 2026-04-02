import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { query } from "../config/db.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token safely
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  // Fetch user
  const result = await query(
    "SELECT id, name, email, avatar_url FROM users WHERE id = $1",
    [decoded.id]
  );

  if (!result.rows.length) {
    throw new ApiError(401, "User no longer exists");
  }

  // Attach user
  req.user = result.rows[0];

  next();
});

export default protect;
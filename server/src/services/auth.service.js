import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

// Generate JWT 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    throw new ApiError(409, "Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, avatar_url, created_at`,
    [name, email, hashedPassword]
  );

  const user = result.rows[0];
  const token = generateToken(user.id);

  return { user, token };
};

//  Login 
const login = async ({ email, password }) => {
  // Get user with password
  const result = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = result.rows[0];

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Remove password before returning
  const { password: _removed, ...safeUser } = user;
  const token = generateToken(safeUser.id);

  return { user: safeUser, token };
};

// Get Me 
const getMe = async (userId) => {
  const result = await query(
    `SELECT id, name, email, avatar_url, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "User not found");
  }

  return result.rows[0];
};

export default { register, login, getMe };
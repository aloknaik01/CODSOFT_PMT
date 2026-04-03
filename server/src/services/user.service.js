import { query } from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Get user by ID
const getUserById = async (userId) => {
  const { rows } = await query(
    `SELECT id, name, email, avatar_url, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!rows[0]) throw new ApiError(404, "User not found");

  return rows[0];
};

// Update profile
const updateProfile = async (userId, { name, email }) => {
  if (!name && !email) {
    throw new ApiError(400, "Nothing to update");
  }

  // check email uniqueness only if changed
  if (email) {
    const { rows } = await query(
      "SELECT 1 FROM users WHERE email = $1 AND id != $2",
      [email, userId]
    );

    if (rows.length) {
      throw new ApiError(409, "Email already in use");
    }
  }

  const { rows } = await query(
    `UPDATE users
     SET
       name  = COALESCE($1, name),
       email = COALESCE($2, email),
       updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, email, avatar_url, updated_at`,
    [name ?? null, email ?? null, userId]
  );

  if (!rows[0]) throw new ApiError(404, "User not found");

  return rows[0];
};

// Update avatar
const updateAvatar = async (userId, file) => {
  if (!file?.tempFilePath) {
    throw new ApiError(400, "Invalid file");
  }

  // get current avatar
  const { rows } = await query(
    "SELECT avatar_public_id FROM users WHERE id = $1",
    [userId]
  );

  if (!rows[0]) throw new ApiError(404, "User not found");

  const oldPublicId = rows[0].avatar_public_id;

  // upload new
  const { url, public_id } = await uploadToCloudinary(
    file.tempFilePath,
    "avatars"
  );

  try {
    // update DB
    const result = await query(
      `UPDATE users
       SET avatar_url = $1, avatar_public_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, avatar_url, updated_at`,
      [url, public_id, userId]
    );

    // delete old only after success
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId).catch(() => {});
    }

    return result.rows[0];
  } catch (err) {
    // rollback cloud upload if DB fails
    await deleteFromCloudinary(public_id).catch(() => {});
    throw err;
  }
};

// Search users
const searchUsers = async (searchTerm, currentUserId) => {
  if (!searchTerm?.trim()) return [];

  const { rows } = await query(
    `SELECT id, name, email, avatar_url
     FROM users
     WHERE (name ILIKE $1 OR email ILIKE $1)
       AND id != $2
     ORDER BY name
     LIMIT 10`,
    [`%${searchTerm.trim()}%`, currentUserId]
  );

  return rows;
};

export default {
  getUserById,
  updateProfile,
  updateAvatar,
  searchUsers,
};
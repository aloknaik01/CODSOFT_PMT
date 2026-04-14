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

// Get all users
const getAllUsers = async () => {
  const { rows } = await query(
    `SELECT 
       u.id, u.name, u.email, u.avatar_url, u.created_at,
       (SELECT COUNT(*) FROM project_members pm WHERE pm.user_id = u.id) as project_count,
       (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) as task_count
     FROM users u
     ORDER BY u.name ASC`
  );

  return rows;
};

// Delete user
const deleteUser = async (userId) => {
  // 1. Get avatar public ID for cleanup
  const { rows } = await query(
    "SELECT avatar_public_id FROM users WHERE id = $1",
    [userId]
  );

  const user = rows[0];
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 2. Delete from DB (foreign keys should cascade or be handled)
  // Assuming cascade is set up in migrations, otherwise we'd need to cleanup projects/tasks
  await query("DELETE FROM users WHERE id = $1", [userId]);

  // 3. Cleanup Cloudinary
  if (user.avatar_public_id) {
    await deleteFromCloudinary(user.avatar_public_id).catch(() => {});
  }

  return true;
};

export default {
  getUserById,
  updateProfile,
  updateAvatar,
  searchUsers,
  getAllUsers,
  deleteUser,
};
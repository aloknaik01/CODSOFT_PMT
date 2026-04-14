import { query, getClient } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

// Get all projects
const getAllProjects = async (userId) => {
  const { rows } = await query(
    `SELECT
       p.*,
       u.name AS owner_name,
       u.email AS owner_email,
       COUNT(DISTINCT t.id) AS total_tasks,
       COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') AS completed_tasks,
       COUNT(DISTINCT pm2.user_id) AS member_count
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN tasks t ON t.project_id = p.id
     LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
     LEFT JOIN project_members pm2 ON pm2.project_id = p.id
     WHERE p.owner_id = $1 OR pm.user_id = $1
     GROUP BY p.id, u.name, u.email
     ORDER BY p.created_at DESC`,
    [userId]
  );

  return rows;
};

// Get project by ID
const getProjectById = async (projectId, userId) => {
  const { rows } = await query(
    `SELECT
       p.*,
       u.name AS owner_name,
       u.email AS owner_email,
       COUNT(DISTINCT t.id) AS total_tasks,
       COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') AS completed_tasks
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN tasks t ON t.project_id = p.id
     LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
     WHERE p.id = $1
       AND (p.owner_id = $2 OR pm.user_id = $2)
     GROUP BY p.id, u.name, u.email`,
    [projectId, userId]
  );

  if (!rows[0]) throw new ApiError(404, "Project not found");

  return rows[0];
};

// Create project (transaction safe)
const createProject = async (userId, { title, description, due_date, color: _color }) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO projects (title, description, due_date, color, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description ?? null, due_date ?? null, _color ?? '#8b5cf6', userId]
    );

    const project = rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, userId]
    );

    await client.query("COMMIT");
    return project;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Update project
const updateProject = async (projectId, userId, updates) => {
  await checkOwner(projectId, userId);

  const { title, description, status, due_date, color } = updates;
  if (!title && !description && !status && !due_date && !color) {
    throw new ApiError(400, "Nothing to update");
  }

  const { rows } = await query(
    `UPDATE projects
     SET
       title       = COALESCE($1, title),
       description = COALESCE($2, description),
       status      = COALESCE($3, status),
       due_date    = COALESCE($4, due_date),
       color       = COALESCE($5, color),
       updated_at  = NOW()
     WHERE id = $6
     RETURNING *`,
    [title ?? null, description ?? null, status ?? null, due_date ?? null, color ?? null, projectId]
  );

  if (!rows[0]) throw new ApiError(404, "Project not found");

  return rows[0];
};

// Delete project
const deleteProject = async (projectId, userId) => {
  await checkOwner(projectId, userId);

  const { rowCount } = await query(
    "DELETE FROM projects WHERE id = $1",
    [projectId]
  );

  if (!rowCount) throw new ApiError(404, "Project not found");
};

// Get members
const getMembers = async (projectId, userId) => {
  await checkMember(projectId, userId);

  const { rows } = await query(
    `SELECT
       u.id, u.name, u.email, u.avatar_url,
       pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.joined_at ASC`,
    [projectId]
  );

  return rows;
};

// Add member
const addMember = async (projectId, userId, { user_id, email, role }) => {
  await checkOwner(projectId, userId);

  // Resolve email → user_id if caller passed email instead of user_id
  let targetUserId = user_id;
  if (!targetUserId && email) {
    const { rows: userRows } = await query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (!userRows.length) {
      throw new ApiError(404, "No account found with that email address");
    }
    targetUserId = userRows[0].id;
  }

  if (!targetUserId) {
    throw new ApiError(400, "Provide either user_id or email");
  }

  if (targetUserId === userId) {
    throw new ApiError(400, "You are already a member");
  }

  const userExists = await query("SELECT 1 FROM users WHERE id = $1", [targetUserId]);
  if (!userExists.rows.length) {
    throw new ApiError(404, "User not found");
  }

  const exists = await query(
    "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, targetUserId]
  );

  if (exists.rows.length) {
    throw new ApiError(409, "Already a member");
  }

  const { rows } = await query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [projectId, targetUserId, role]
  );

  return rows[0];
};

// Remove member
const removeMember = async (projectId, userId, memberId) => {
  await checkOwner(projectId, userId);

  if (memberId === userId) {
    throw new ApiError(400, "Owner cannot be removed");
  }

  const { rowCount } = await query(
    `DELETE FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, memberId]
  );

  if (!rowCount) {
    throw new ApiError(404, "Member not found");
  }
};

// Helpers
const checkOwner = async (projectId, userId) => {
  const { rows } = await query(
    "SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2",
    [projectId, userId]
  );

  if (!rows.length) {
    throw new ApiError(403, "Only owner allowed");
  }
};

const checkMember = async (projectId, userId) => {
  const { rows } = await query(
    "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );

  if (!rows.length) {
    throw new ApiError(403, "Not a project member");
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  removeMember,
};
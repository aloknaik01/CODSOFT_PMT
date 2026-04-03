import { query, getClient } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Check membership (returns role)
const checkProjectMember = async (projectId, userId) => {
  const { rows } = await query(
    `SELECT role FROM project_members 
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );

  if (!rows.length) {
    throw new ApiError(403, "Not a project member");
  }

  return rows[0].role;
};

// Ensure task exists
const getTaskOrThrow = async (taskId, projectId) => {
  const { rows } = await query(
    `SELECT id, status FROM tasks 
     WHERE id = $1 AND project_id = $2`,
    [taskId, projectId]
  );

  if (!rows.length) {
    throw new ApiError(404, "Task not found");
  }

  return rows[0];
};

// Get next position in a column
const getNextPosition = async (projectId, status) => {
  const { rows } = await query(
    `SELECT COALESCE(MAX(position), -1) + 1 AS position
     FROM tasks
     WHERE project_id = $1 AND status = $2`,
    [projectId, status]
  );

  return rows[0].position;
};

// Validate assignee
const validateAssignee = async (projectId, assigneeId) => {
  if (!assigneeId) return;

  try {
    await checkProjectMember(projectId, assigneeId);
  } catch {
    throw new ApiError(400, "Assignee must be a project member");
  }
};



// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────

// Get all tasks
const getTasksByProject = async (projectId, userId) => {
  await checkProjectMember(projectId, userId);

  const { rows } = await query(
    `SELECT
       t.id, t.title, t.status, t.priority, t.position,
       t.due_date, t.created_at,
       u.name AS assignee_name,
       u.avatar_url AS assignee_avatar
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = $1
     ORDER BY t.status, t.position, t.created_at`,
    [projectId]
  );

  return rows;
};

// Get single task
const getTaskById = async (taskId, projectId, userId) => {
  await checkProjectMember(projectId, userId);

  const { rows } = await query(
    `SELECT
       t.*,
       u.name AS assignee_name,
       c.name AS created_by_name,
       COALESCE(JSON_AGG(a.*) FILTER (WHERE a.id IS NOT NULL), '[]') AS attachments
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     LEFT JOIN users c ON c.id = t.created_by
     LEFT JOIN attachments a ON a.task_id = t.id
     WHERE t.id = $1 AND t.project_id = $2
     GROUP BY t.id, u.name, c.name`,
    [taskId, projectId]
  );

  if (!rows.length) throw new ApiError(404, "Task not found");

  return rows[0];
};

// Create task
const createTask = async (projectId, userId, data) => {
  await checkProjectMember(projectId, userId);
  await validateAssignee(projectId, data.assignee_id);

  const status = data.status || "todo";
  const position = await getNextPosition(projectId, status);

  const { rows } = await query(
    `INSERT INTO tasks
      (title, description, status, priority, due_date,
       position, project_id, assignee_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.title,
      data.description ?? null,
      status,
      data.priority || "medium",
      data.due_date ?? null,
      position,
      projectId,
      data.assignee_id ?? null,
      userId,
    ]
  );

  return rows[0];
};

// Update task
const updateTask = async (taskId, projectId, userId, updates) => {
  await checkProjectMember(projectId, userId);
  await getTaskOrThrow(taskId, projectId);
  await validateAssignee(projectId, updates.assignee_id);

  const { rows } = await query(
    `UPDATE tasks SET
       title       = COALESCE($1, title),
       description = COALESCE($2, description),
       priority    = COALESCE($3, priority),
       due_date    = COALESCE($4, due_date),
       assignee_id = COALESCE($5, assignee_id)
     WHERE id = $6 AND project_id = $7
     RETURNING *`,
    [
      updates.title,
      updates.description,
      updates.priority,
      updates.due_date,
      updates.assignee_id,
      taskId,
      projectId,
    ]
  );

  return rows[0];
};

// Update status (Kanban move)
const updateTaskStatus = async (taskId, projectId, userId, status) => {
  await checkProjectMember(projectId, userId);

  const task = await getTaskOrThrow(taskId, projectId);
  if (task.status === status) return task; // no-op

  const position = await getNextPosition(projectId, status);

  const { rows } = await query(
    `UPDATE tasks
     SET status = $1, position = $2
     WHERE id = $3 AND project_id = $4
     RETURNING *`,
    [status, position, taskId, projectId]
  );

  return rows[0];
};

// Reorder tasks (optimized 🚀)
const reorderTasks = async (projectId, userId, tasks) => {
  await checkProjectMember(projectId, userId);

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const queryText = `
      UPDATE tasks AS t SET position = v.position
      FROM (VALUES ${tasks.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",")})
      AS v(id, position)
      WHERE t.id = v.id AND t.project_id = $${tasks.length * 2 + 1}
    `;

    const values = tasks.flatMap(t => [t.id, t.position]);
    values.push(projectId);

    await client.query(queryText, values);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Delete
const deleteTask = async (taskId, projectId, userId) => {
  await checkProjectMember(projectId, userId);
  await getTaskOrThrow(taskId, projectId);

  await query(
    `DELETE FROM tasks WHERE id = $1 AND project_id = $2`,
    [taskId, projectId]
  );
};

export default {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  reorderTasks,
  deleteTask,
};
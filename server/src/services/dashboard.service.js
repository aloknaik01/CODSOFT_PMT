import { query } from "../config/db.js";

const getStats = async (userId) => {
  // 1. Project stats
  const projectStats = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'active') as active
     FROM projects 
     WHERE owner_id = $1 OR id IN (SELECT project_id FROM project_members WHERE user_id = $1)`,
    [userId]
  );

  // 2. Task stats
  const taskStats = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'done') as completed,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'todo') as todo,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') as overdue
     FROM tasks 
     WHERE created_by = $1 OR assignee_id = $1`,
    [userId]
  );

  // 3. Team stats (unique members across all projects you own/are in)
  const teamStats = await query(
    `SELECT COUNT(DISTINCT user_id) as count
     FROM project_members 
     WHERE project_id IN (
       SELECT id FROM projects WHERE owner_id = $1
       UNION
       SELECT project_id FROM project_members WHERE user_id = $1
     )`,
    [userId]
  );

  // 4. Weekly trend (last 7 days completions vs creations)
  const weeklyTrend = await query(
    `SELECT 
       TO_CHAR(d.day, 'Dy') as day,
       COUNT(t.id) FILTER (WHERE t.status = 'done') as completed,
       COUNT(t.id) FILTER (WHERE DATE(t.created_at) = d.day) as created
     FROM (
       SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date as day
     ) d
     LEFT JOIN tasks t ON (DATE(t.updated_at) = d.day AND t.status = 'done') 
       OR DATE(t.created_at) = d.day
     WHERE t.id IS NULL OR (t.created_by = $1 OR t.assignee_id = $1)
     GROUP BY d.day
     ORDER BY d.day ASC`,
    [userId]
  );

  return {
    totalProjects: parseInt(projectStats.rows[0].total || 0),
    activeProjects: parseInt(projectStats.rows[0].active || 0),
    totalTasks: parseInt(taskStats.rows[0].total || 0),
    completedTasks: parseInt(taskStats.rows[0].completed || 0),
    inProgressTasks: parseInt(taskStats.rows[0].in_progress || 0),
    todoTasks: parseInt(taskStats.rows[0].todo || 0),
    overdueTasks: parseInt(taskStats.rows[0].overdue || 0),
    teamMembers: parseInt(teamStats.rows[0].count || 0),
    weeklyTrend: weeklyTrend.rows.map(r => ({
      day: r.day,
      completed: parseInt(r.completed || 0),
      tasks: parseInt(r.created || 0)
    }))
  };
};

const getActivityFeed = async (userId) => {

  const { rows } = await query(
    `SELECT 
      t.id, t.title as "taskTitle", t.status, t.updated_at as "createdAt",
      u.name, u.avatar_url as avatar
     FROM tasks t
     JOIN users u ON u.id = t.assignee_id
     WHERE t.created_by = $1 OR t.assignee_id = $1
     ORDER BY t.updated_at DESC
     LIMIT 10`,
    [userId]
  );

  return rows.map(r => ({
    id: r.id,
    action: r.status === 'done' ? 'completed task' : `updated task to ${r.status}`,
    entityType: 'task',
    createdAt: r.createdAt,
    user: {
      name: r.name,
      avatar: r.avatar
    },
    metadata: {
      taskTitle: r.taskTitle
    }
  }));
};

export default {
  getStats,
  getActivityFeed
};

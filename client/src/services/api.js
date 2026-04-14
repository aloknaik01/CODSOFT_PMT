// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

const DEFAULT_HEADERS = { "Content-Type": "application/json" };

// Module-level cache: taskId → projectId (populated on apiListTasks)
const taskProjectMap = new Map();

// ─── Normalizers ──────────────────────────────────────────────────────────────

// Backend uses snake_case + title; frontend uses camelCase + name
function normalizeProject(p) {
  if (!p) return p;
  return {
    ...p,
    // map title → name so all frontend code using project.name works
    name: p.name ?? p.title ?? "Untitled",
    totalTasks: Number(p.totalTasks ?? p.total_tasks ?? 0),
    completedTasks: Number(p.completedTasks ?? p.completed_tasks ?? 0),
    memberCount: Number(p.memberCount ?? p.member_count ?? 0),
    // backend returns due_date; frontend expects dueDate
    dueDate: p.dueDate ?? p.due_date ?? null,
    // getAllProjects doesn't join member rows, only member_count; default to []
    members: Array.isArray(p.members) ? p.members : [],
    color: p.color ?? "#8B5CF6",
    status: p.status ?? "active",
  };
}

function normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    // map avatar_url → avatar
    avatar: u.avatar ?? u.avatar_url ?? null,
    role: u.role ?? "member",
    createdAt: u.createdAt ?? u.created_at ?? null,
    joinedAt: u.joinedAt ?? u.joined_at ?? null,
    projectCount: Number(u.project_count ?? u.projectCount ?? 0),
    taskCount: Number(u.task_count ?? u.taskCount ?? 0),
  };
}

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: DEFAULT_HEADERS,
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message ?? body.error ?? res.statusText;
    throw new Error(msg);
  }
  if ("data" in body && "success" in body) {
    return body;
  }
  return { data: body, success: true };
}

async function requestRaw(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message ?? body.error ?? res.statusText;
    throw new Error(msg);
  }
  if ("data" in body && "success" in body) {
    return body;
  }
  return { data: body, success: true };
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function apiLogin(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function apiRegister(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetCurrentUser() {
  const res = await request("/auth/me");
  if (res?.data) {
    return { ...res, data: normalizeUser(res.data) };
  }
  return res;
}

export async function apiLogout() {
  return request("/auth/logout", { method: "POST" });
}

// Stubs — not in PDF, return safe empty values
export async function apiForgotPassword(_email) {
  return {
    data: { message: "If that email exists, a reset link was sent." },
    success: true,
  };
}

export async function apiResetPassword(_token, _password) {
  return { data: {}, success: true };
}

export async function apiRefreshToken(token) {
  return { data: { token }, success: true };
}

// ─── Users API ────────────────────────────────────────────────────────────────

export async function apiGetUserProfile() {
  const res = await request("/users/profile");
  if (res?.data) {
    return { ...res, data: normalizeUser(res.data) };
  }
  return res;
}

export async function apiUpdateUserProfile(data) {
  return request("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateAvatar(formData) {
  // Do NOT set Content-Type — browser sets it with the multipart boundary
  return requestRaw("/users/profile/avatar", {
    method: "PATCH",
    body: formData,
  });
}

export async function apiDeleteAccount() {
  return request("/users/profile", {
    method: "DELETE",
  });
}

export async function apiSearchUsers(query) {
  return request(`/users/search?q=${encodeURIComponent(query)}`);
}

// Keep for pages that call apiGetCurrentUser() via this alias
export async function apiGetUser(_userId) {
  return apiGetCurrentUser();
}

// Stub — not in PDF
export async function apiListUsers() {
  const res = await request("/users");
  const users = Array.isArray(res.data) ? res.data : [];
  return { ...res, data: users.map(normalizeUser) };
}

// Stub — not in PDF
export async function apiGetUserActivity(_userId) {
  return { data: [], success: true };
}

// Keep signature pages use (userId param, but maps to updateProfile)
export async function apiUpdateUser(_userId, payload) {
  return apiUpdateUserProfile(payload);
}

// ─── Projects API ─────────────────────────────────────────────────────────────

export async function apiListProjects() {
  const res = await request("/projects");
  const projects = Array.isArray(res.data) ? res.data : [];
  return { ...res, data: projects.map(normalizeProject) };
}

export async function apiCreateProject(payload) {
  // Backend expects { title, description, due_date }
  const { name, color, dueDate, ...rest } = payload;
  return request("/projects", {
    method: "POST",
    body: JSON.stringify({ title: name, due_date: dueDate, ...rest }),
  });
}

export async function apiGetProject(projectId) {
  const res = await request(`/projects/${projectId}`);
  return { ...res, data: normalizeProject(res.data) };
}

export async function apiUpdateProject(projectId, payload) {
  return request(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteProject(projectId) {
  return request(`/projects/${projectId}`, { method: "DELETE" });
}

// Stub — derive from task list instead
export async function apiGetProjectStats(_projectId) {
  return { data: { totalTasks: 0, completedTasks: 0 }, success: true };
}

// ─── Members API ──────────────────────────────────────────────────────────────

export async function apiListMembers(projectId) {
  const res = await request(`/projects/${projectId}/members`);
  const mapped = (res.data || []).map((m) => ({
    id: m.id, // the backend returns user id as id here, we usually expect member row id, but this is fine
    role: m.role,
    joinedAt: m.joined_at,
    userId: m.id,
    user: {
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar_url,
    },
  }));
  return { ...res, data: mapped };
}

export async function apiInviteMember(payload) {
  return request(`/projects/${payload.projectId}/members`, {
    method: "POST",
    body: JSON.stringify({ email: payload.email, role: payload.role }),
  });
}

export async function apiRemoveMember(memberId, projectId) {
  const path = projectId
    ? `/projects/${projectId}/members/${memberId}`
    : `/members/${memberId}`;
  return request(path, { method: "DELETE" });
}

// Stub — endpoint not in PDF
export async function apiUpdateMemberRole(_memberId, _role) {
  return { data: {}, success: true };
}

// ─── Tasks API ────────────────────────────────────────────────────────────────

export async function apiListTasks(projectId) {
  if (!projectId) {
    // No cross-project endpoint — return empty; callers that need all tasks
    // should iterate over projects themselves
    return { data: [], success: true };
  }
  const res = await request(`/projects/${projectId}/tasks`);
  // Populate cache for later use by single-task operations
  for (const t of res.data) {
    taskProjectMap.set(t.id, projectId);
  }
  return res;
}

export async function apiCreateTask(payload) {
  const { projectId, ...rest } = payload;
  const res = await request(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(rest),
  });
  taskProjectMap.set(res.data.id, projectId);
  return res;
}

export async function apiGetTask(projectId, taskId) {
  return request(`/projects/${projectId}/tasks/${taskId}`);
}

export async function apiUpdateTask(
  taskIdOrProjectId,
  payloadOrTaskId,
  maybePayload,
) {
  // Support two call signatures:
  //   apiUpdateTask(taskId, payload)           — legacy pages call
  //   apiUpdateTask(projectId, taskId, payload) — new signature from requirements
  let projectId;
  let taskId;
  let payload;

  if (maybePayload !== undefined && typeof payloadOrTaskId === "string") {
    // New signature: (projectId, taskId, payload)
    projectId = taskIdOrProjectId;
    taskId = payloadOrTaskId;
    payload = maybePayload;
  } else {
    // Legacy signature: (taskId, payload)
    taskId = taskIdOrProjectId;
    payload = payloadOrTaskId;
    const cached = taskProjectMap.get(taskId);
    if (!cached) throw new Error("Unknown project for task: load tasks first");
    projectId = cached;
  }

  return request(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateTaskStatus(projectId, taskId, status) {
  return request(`/projects/${projectId}/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function apiReorderTasks(projectId, tasks) {
  return request(`/projects/${projectId}/tasks/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ tasks }),
  });
}

export async function apiDeleteTask(taskIdOrProjectId, maybeTaskId) {
  let projectId;
  let taskId;
  if (maybeTaskId !== undefined) {
    // New signature: (projectId, taskId)
    projectId = taskIdOrProjectId;
    taskId = maybeTaskId;
  } else {
    // Legacy signature: (taskId)
    taskId = taskIdOrProjectId;
    const cached = taskProjectMap.get(taskId);
    if (!cached) throw new Error("Unknown project for task: load tasks first");
    projectId = cached;
    taskProjectMap.delete(taskId);
  }

  return request(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// Convenience delegates used by pages (legacy signatures)
export async function apiMoveTask(taskId, status) {
  const projectId = taskProjectMap.get(taskId);
  if (!projectId) throw new Error("Unknown project for task: load tasks first");
  return apiUpdateTaskStatus(projectId, taskId, status);
}

export async function apiAssignTask(projectId, taskId, userId) {
  return apiUpdateTask(projectId, taskId, { assigneeId: userId });
}

export async function apiUpdateTaskPriority(projectId, taskId, priority) {
  return apiUpdateTask(projectId, taskId, { priority });
}

// ─── Comments — Stubs (not in PDF) ───────────────────────────────────────────

export async function apiListComments(_taskId) {
  return { data: [], success: true };
}

export async function apiCreateComment(_taskId, _content) {
  return { data: {}, success: true };
}

export async function apiDeleteComment(_commentId) {
  return { data: {}, success: true };
}

// ─── Dashboard — Stub ────────────────────────────────────────────────────────

export async function apiGetDashboardStats() {
  return request("/dashboard/stats");
}

// ─── Activity — Stub ─────────────────────────────────────────────────────────

export async function apiGetActivityFeed(page = 1, pageSize = 10) {
  return request(`/dashboard/activity?page=${page}&pageSize=${pageSize}`);
}

// ─── Notifications — Stubs ───────────────────────────────────────────────────

export async function apiGetNotifications() {
  return { data: [], success: true };
}

export async function apiMarkNotificationRead(_notifId) {
  return { data: {}, success: true };
}

export async function apiMarkAllNotificationsRead() {
  return { data: {}, success: true };
}

// ─── Reports — Stub ──────────────────────────────────────────────────────────

export async function apiGetReport() {
  return { data: {}, success: true };
}

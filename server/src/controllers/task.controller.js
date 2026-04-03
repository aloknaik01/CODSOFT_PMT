import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import taskService from "../services/task.service.js";

//   GET /api/projects/:projectId/tasks      
export const getTasksByProject = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByProject(
    req.params.projectId,
    req.user.id
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched", tasks));
});

//   GET /api/projects/:projectId/tasks/:taskId  
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(
    req.params.taskId,
    req.params.projectId,
    req.user.id
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Task fetched", task));
});

//   POST /api/projects/:projectId/tasks      
export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(
    req.params.projectId,
    req.user.id,
    req.body
  );

  res
    .status(201)
    .json(new ApiResponse(201, "Task created", task));
});

//   PATCH /api/projects/:projectId/tasks/:taskId   
export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.taskId,
    req.params.projectId,
    req.user.id,
    req.body
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Task updated", task));
});

//   PATCH /api/projects/:projectId/tasks/:taskId/status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.params.taskId,
    req.params.projectId,
    req.user.id,
    req.body.status
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Task status updated", task));
});

//   PATCH /api/projects/:projectId/tasks/reorder   
export const reorderTasks = asyncHandler(async (req, res) => {
  await taskService.reorderTasks(
    req.params.projectId,
    req.user.id,
    req.body.tasks
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Tasks reordered", null));
});

//   DELETE /api/projects/:projectId/tasks/:taskId  ─
export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(
    req.params.taskId,
    req.params.projectId,
    req.user.id
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Task deleted", null));
});
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import taskService from "../services/task.service.js";

// helper to extract params cleanly
const getParams = (req) => ({
  projectId: req.params.projectId,
  taskId: req.params.taskId,
  userId: req.user.id,
});


// GET tasks by project
export const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId, userId } = getParams(req);

  const tasks = await taskService.getTasksByProject(projectId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched", tasks));
});


// GET single task
export const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId, userId } = getParams(req);

  const task = await taskService.getTaskById(taskId, projectId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched", task));
});


// CREATE task
export const createTask = asyncHandler(async (req, res) => {
  const { projectId, userId } = getParams(req);

  const task = await taskService.createTask(
    projectId,
    userId,
    req.body
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Task created", task));
});


// UPDATE task
export const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId, userId } = getParams(req);

  const task = await taskService.updateTask(
    taskId,
    projectId,
    userId,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated", task));
});


// UPDATE status (Kanban)
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { projectId, taskId, userId } = getParams(req);

  const { status } = req.body;

  const task = await taskService.updateTaskStatus(
    taskId,
    projectId,
    userId,
    status
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Task status updated", task));
});


// REORDER tasks
export const reorderTasks = asyncHandler(async (req, res) => {
  const { projectId, userId } = getParams(req);

  await taskService.reorderTasks(
    projectId,
    userId,
    req.body.tasks
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks reordered", null));
});


// DELETE task
export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId, userId } = getParams(req);

  await taskService.deleteTask(taskId, projectId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted", null));
});
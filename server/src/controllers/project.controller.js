import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import projectService from "../services/project.service.js";

// GET /projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Projects fetched", projects));
});

// GET /projects/:id
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Project ID required");

  const project = await projectService.getProjectById(id, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Project fetched", project));
});

// POST /projects
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, due_date } = req.body;

  const project = await projectService.createProject(req.user.id, {
    title,
    description,
    due_date,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Project created", project));
});

// PATCH /projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Project ID required");

  const project = await projectService.updateProject(
    id,
    req.user.id,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Project updated", project));
});

// DELETE /projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Project ID required");

  await projectService.deleteProject(id, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Project deleted", null));
});

// GET /projects/:id/members
export const getMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const members = await projectService.getMembers(id, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Members fetched", members));
});

// POST /projects/:id/members
export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await projectService.addMember(
    id,
    req.user.id,
    req.body
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Member added", member));
});

// DELETE /projects/:id/members/:memberId
export const removeMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;

  await projectService.removeMember(
    id,
    req.user.id,
    memberId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Member removed", null));
});
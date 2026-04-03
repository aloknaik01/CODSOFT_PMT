import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  removeMember,
} from "../controllers/project.controller.js";
import protect from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../validations/project.validation.js";

const router = Router();

// All project routes are protected
router.use(protect);

//  Project CRUD
router.get("/",     getAllProjects);
router.post("/",    validate(createProjectSchema), createProject);
router.get("/:id",  getProjectById);
router.patch("/:id",validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);

//  Member Management 
router.get("/:id/members", getMembers);
router.post("/:id/members", validate(addMemberSchema), addMember);
router.delete("/:id/members/:memberId", removeMember);

export default router;



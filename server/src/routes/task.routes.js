import { Router } from "express";
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  reorderTasks,
  deleteTask,
} from "../controllers/task.controller.js";
import protect from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  reorderTasksSchema,
} from "../validations/task.validation.js";


const router = Router({ mergeParams: true });

router.use(protect);

router.get("/", getTasksByProject);
router.post("/",  validate(createTaskSchema),   createTask);
router.patch("/reorder", validate(reorderTasksSchema), reorderTasks);
router.get("/:taskId",  getTaskById);
router.patch("/:taskId",  validate(updateTaskSchema),   updateTask);
router.patch("/:taskId/status", validate(updateStatusSchema), updateTaskStatus);
router.delete("/:taskId",  deleteTask);

export default router;
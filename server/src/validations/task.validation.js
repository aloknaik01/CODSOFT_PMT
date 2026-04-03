import { z } from "zod";

// reusable date schema
const dateSchema = z
  .string()
  .trim()
  .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format")
  .transform((val) => (val ? new Date(val) : null))
  .optional()
  .nullable();

// Create Task
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long"),

  description: z
    .string()
    .trim()
    .max(2000, "Description too long")
    .optional()
    .nullable(),

  status: z
    .enum(["todo", "in_progress", "done"])
    .default("todo"),

  priority: z
    .enum(["low", "medium", "high"])
    .default("medium"),

  due_date: dateSchema,

  assignee_id: z
    .string()
    .uuid("Invalid assignee ID")
    .optional()
    .nullable(),
});

// Update Task
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title too long")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Description too long")
      .optional()
      .nullable(),

    priority: z
      .enum(["low", "medium", "high"])
      .optional(),

    due_date: dateSchema,

    assignee_id: z
      .string()
      .uuid("Invalid assignee ID")
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.due_date !== undefined ||
      data.assignee_id !== undefined,
    {
      message: "At least one field must be updated",
    }
  );

// Update Status (Kanban)
export const updateStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]),
});

// Reorder Tasks
export const reorderTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string().uuid("Invalid task ID"),
        position: z.number().int().min(0),
      })
    )
    .min(1, "Tasks array cannot be empty"),
});
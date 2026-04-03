import { z } from "zod";

// reusable date schema
const dateSchema = z
  .string()
  .trim()
  .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format")
  .transform((val) => (val ? new Date(val) : null))
  .optional()
  .nullable();

// Create Project
export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long"),

  description: z
    .string()
    .trim()
    .max(1000, "Description too long")
    .optional()
    .nullable(),

  due_date: dateSchema,
});

// Update Project
export const updateProjectSchema = z
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
      .max(1000, "Description too long")
      .optional()
      .nullable(),

    status: z
      .enum(["active", "completed", "archived"])
      .optional(),

    due_date: dateSchema,
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.due_date !== undefined,
    {
      message: "At least one field must be updated",
    }
  );

// Add Member
export const addMemberSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),

  role: z
    .enum(["member", "viewer"])
    .default("member"),
});
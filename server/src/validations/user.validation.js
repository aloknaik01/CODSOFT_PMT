import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .transform((val) => val.toLowerCase())
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.email !== undefined,
    {
      message: "At least one field (name or email) must be provided",
    }
  );
import { z } from "zod";

export const addTaskSchema = z.object({
  column_id: z.string().min(2, { message: "Column Id is required" }),
  title: z
    .string({
      required_error: "Task title is required",
      invalid_type_error: "Task title must be a string",
    })
    .trim()
    .min(2, { message: "Task title must be at least 2 characters" }),
});

import { z } from "zod";

export const addColumnSchema = z.object({
  title: z
    .string({
      required_error: "Column title is required",
      invalid_type_error: "Column title must be a string",
    })
    .trim()
    .min(2, { message: "Column title must be at least 2 characters" }),
});

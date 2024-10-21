import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .max(450, { message: "Content must be less than 450 characters" }),
});

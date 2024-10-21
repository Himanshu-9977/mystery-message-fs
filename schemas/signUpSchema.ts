import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Min 2 chars")
  .max(20, "Max 20 chars")
  .regex(/^[a-zA-Z0-9_]+$/, "Special characters are not allowed");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});

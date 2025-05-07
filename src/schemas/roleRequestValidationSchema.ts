import { z } from "zod";

export const roleRequestSchema = z.object({
  userId: z.number().int().positive(),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  age: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 18 && num <= 120;
    },
    {
      message: "Age must be a number between 18 and 120",
    }
  ),
  photoURL: z.string(),
  coverLetter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters"),
  links: z
    .array(
      z.object({
        key: z.string().min(1, "Link key cannot be empty"),
        value: z.string().url("Link must be a valid URL"),
      })
    )
    .min(1, "At least one link is required"),
});

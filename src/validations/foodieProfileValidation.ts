import { z } from "zod";

export const createFoodieProfileSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15),

  location: z.string().min(2, "Location is required"),

preferences: z.array(z.string(), {
  error: "Preferences must be an array of strings",
}).optional(),

  bio: z
    .string()
    .max(300, "Bio should not exceed 300 characters")
    .optional(),

  image: z.string().url("Image must be a valid URL").optional(),
});

export const updateFoodieProfileSchema = z.object({
   name: z.string().min(3, 'Username must be at least 3 characters long'),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15),

  location: z.string().min(2, "Location is required"),

preferences: z.array(z.string(), {
  error: "Preferences must be an array of strings",
}).optional(),
  bio: z
    .string()
    .max(300, "Bio should not exceed 300 characters")
    .optional(),

  image: z.string().url("Image must be a valid URL").optional(),
});

export type CreateFoodieProfileDto = z.infer<typeof createFoodieProfileSchema>;

export type UpdateFoodieProfileDto = z.infer<typeof updateFoodieProfileSchema>;
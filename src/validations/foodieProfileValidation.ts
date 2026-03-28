import { z } from "zod";

export const createFoodieProfileSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15),

  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }),
  address: z.string().min(2, "Address is required"),

  preferences: z.object({
    recipeCategory: z.array(z.string()).default([]),
    blogTags: z.array(z.string()).default([])
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

  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }),
  address: z.string().min(2, "Address is required"),

  preferences: z.object({
    recipeCategory: z.array(z.string()).default([]),
    blogTags: z.array(z.string()).default([])
  }).optional(),
  bio: z
    .string()
    .max(300, "Bio should not exceed 300 characters")
    .optional(),

  image: z.string().url("Image must be a valid URL").optional(),
});

export type CreateFoodieProfileDto = z.infer<typeof createFoodieProfileSchema>;

export type UpdateFoodieProfileDto = z.infer<typeof updateFoodieProfileSchema>;
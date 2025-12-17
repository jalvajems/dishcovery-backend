import { email, z } from "zod";


export const createChefProfileSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone must be a valid number"),

  location: z
    .string()
    .min(2, "Location is required"),

  specialities: z
    .string().min(2)
    .min(1, "At least one speciality is required"),

  image: z
    .string()
    .optional(),
  bio: z
    .string()
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),
});


export const updateChefProfileSchema = z.object({
  name: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().min(3, 'Username must be at least 3 characters long'),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone must be a valid number"),

  location: z
    .string()
    .min(2, "Location is required"),

  specialities: z
    .array(z.string().min(2))
    .min(1, "At least one speciality is required"),

  image: z
    .string()
    .optional(),
  bio: z
    .string()
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),
});

export type CreateChefProfileDto = z.infer<
  typeof createChefProfileSchema
>;

export type UpdateChefProfileDto = z.infer<
  typeof updateChefProfileSchema
>;
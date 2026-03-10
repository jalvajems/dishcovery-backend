import { z } from "zod";


export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),

  content: z
    .string()
    .min(20, "Content must be at least 20 characters"),

  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional(),

  tags: z
    .array(z.string().min(2))
    .optional(),

  isDraft: z
    .boolean()
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),
});

export const updateBlogSchema = createBlogSchema
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field is required to update blog" }
  );



export type CreateBlogDto = z.infer<typeof createBlogSchema>;
export type UpdateBlogDto = z.infer<typeof updateBlogSchema>;

import { z } from "zod";


const recipeBaseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  cuisine: z
    .string()
    .min(2, "Cuisine is required"),

  cookingTime: z
    .number()
    .int()
    .positive("Cooking time must be greater than 0"),

  dietType: z
    .array(z.string().min(2))
    .optional(),

  ingredients: z
    .array(z.string().min(2))
    .min(1, "At least one ingredient is required"),

  steps: z
    .array(z.string().min(2))
    .min(1, "At least one step is required"),

  tags: z
    .array(z.string().min(2))
    .optional(),

images: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (typeof val === "string") return [val];
      return val;
    },
    z.array(z.string().url("Invalid image URL")).optional()
  ),

  isDraft: z.boolean().optional(),
});

export const createRecipeSchema=recipeBaseSchema.extend({})

export const updateRecipeSchema = z.object({
  title: z.string().min(3).optional(),
  cuisine: z.string().min(2).optional(),

  cookingTime: z.preprocess(
    val => val === undefined ? undefined : Number(val),
    z.number().int().positive().optional()
  ),

  dietType: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).min(1).optional(),
  steps: z.array(z.string()).min(1).optional(),
  tags: z.array(z.string()).optional(),

  images: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (typeof val === "string") return [val];
      return val;
    },
    z.array(z.string().url("Invalid image URL")).optional()
  ),

  isDraft: z.boolean().optional(),
});

export const editRecipeRequestSchema = z.object({
  recipeId: z.string().min(24, "Invalid recipe id"),
  recipeData: updateRecipeSchema.refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field is required to update recipe" }
  ),
});





export type CreateRecipeDto = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeDto = z.infer<typeof editRecipeRequestSchema>;

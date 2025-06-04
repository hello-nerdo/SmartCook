import { z } from 'zod';

// Photo schema
export const PhotoSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  filename: z.string(),
  imageId: z.string().optional(),
  contentType: z.string(),
  size: z.number().int().positive(),
  metadata: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export type Photo = z.infer<typeof PhotoSchema>;

// Recipe schema
export const RecipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  preparationTime: z.enum(['any', 'quick', 'medium', 'long']),
  complexity: z.enum(['any', 'easy', 'medium', 'hard']),
  ingredients: z.string(), // JSON string in the database
  instructions: z.string(), // JSON string in the database
  image: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DBRecipe = z.infer<typeof RecipeSchema>;

// API Schema for creating a new recipe
export const CreateRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  preparationTime: z.enum(['any', 'quick', 'medium', 'long']),
  complexity: z.enum(['any', 'easy', 'medium', 'hard']),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  image: z.string().optional(),
});

// API Schema for updating a recipe
export const UpdateRecipeSchema = CreateRecipeSchema.partial();

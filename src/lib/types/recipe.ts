// Recipe type definitions
import { Prettify } from './index';

export interface Recipe {
  id?: string;
  userId?: string;
  title: string;
  description: string;
  preparationTime: PrepTime;
  complexity: ComplexityLevel;
  ingredients: string[];
  instructions: string[];
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatabaseRecipe extends Prettify<Omit<Recipe, 'ingredients' | 'instructions'>> {
  ingredients: string; // JSON string in the database
  instructions: string; // JSON string in the database
}

export interface RecipeResponse {
  recipes: Recipe[];
}

export type ComplexityLevel = 'any' | 'easy' | 'medium' | 'hard';
export type PrepTime = 'any' | 'quick' | 'medium' | 'long'; 
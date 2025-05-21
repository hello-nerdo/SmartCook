// Recipe type definitions

export interface Recipe {
  title: string;
  description: string;
  preparationTime: PrepTime;
  complexity: ComplexityLevel;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

export interface RecipeResponse {
  recipes: Recipe[];
}

export type ComplexityLevel = 'any' | 'easy' | 'medium' | 'hard';
export type PrepTime = 'any' | 'quick' | 'medium' | 'long'; 
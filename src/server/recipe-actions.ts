'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

import { LOGIN_REDIRECT_URL } from '@/lib/constants';
import { getDb } from '@/db';
import { Recipe, DatabaseRecipe } from '@/lib/types/recipe';
import { CreateRecipeSchema, DBRecipe, UpdateRecipeSchema } from '@/db/types';

// Define response types
type RecipeSuccessResponse = {
  success: true;
  recipe: Recipe;
};

type RecipeErrorResponse = {
  success: false;
  error: string;
};

type RecipeResponse = RecipeSuccessResponse | RecipeErrorResponse;

type RecipesSuccessResponse = {
  success: true;
  recipes: Recipe[];
};

type RecipesErrorResponse = {
  success: false;
  error: string;
};

type RecipesResponse = RecipesSuccessResponse | RecipesErrorResponse;

type DeleteRecipeResponse = 
  | { success: true }
  | { success: false; error: string };

// Save a new recipe
export async function saveRecipe(
  recipe: Recipe
): Promise<RecipeResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect(LOGIN_REDIRECT_URL);
    }

    // Validate the recipe data
    const validatedData = CreateRecipeSchema.parse({
      ...recipe,
      // Ensure arrays for ingredients and instructions
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
    });

    const db = await getDb();
    const recipeId = nanoid();
    const now = new Date().toISOString();

    // Convert arrays to JSON strings for database storage
    const dbRecipe: DatabaseRecipe = {
      id: recipeId,
      userId,
      title: validatedData.title,
      description: validatedData.description,
      preparationTime: validatedData.preparationTime,
      complexity: validatedData.complexity,
      ingredients: JSON.stringify(validatedData.ingredients),
      instructions: JSON.stringify(validatedData.instructions),
      image: validatedData.image,
      createdAt: now,
      updatedAt: now
    };

    // Insert into database
    const result = await db
      .prepare(
        `INSERT INTO recipes (
          id, userId, title, description, preparationTime, complexity, 
          ingredients, instructions, image, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        dbRecipe.id,
        dbRecipe.userId,
        dbRecipe.title,
        dbRecipe.description,
        dbRecipe.preparationTime,
        dbRecipe.complexity,
        dbRecipe.ingredients,
        dbRecipe.instructions,
        dbRecipe.image || null,
        dbRecipe.createdAt,
        dbRecipe.updatedAt
      )
      .run();

    if (!result.success) {
      console.error('Failed to save recipe:', result);
      return { success: false, error: 'Failed to save recipe' };
    }

    // Return the recipe with arrays, not JSON strings
    return {
      success: true,
      recipe: {
        ...dbRecipe,
        ingredients: validatedData.ingredients,
        instructions: validatedData.instructions
      }
    };
  } catch (error) {
    console.error('Error saving recipe:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save recipe'
    };
  }
}

// Get all recipes for the current user
export async function getUserRecipes(): Promise<RecipesResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect(LOGIN_REDIRECT_URL);
    }

    const db = await getDb();
    const result = await db
      .prepare('SELECT * FROM recipes WHERE userId = ? ORDER BY updatedAt DESC')
      .bind(userId)
      .all();

    if (!result.success) {
      console.error('Failed to fetch recipes:', result);
      return { success: false, error: 'Failed to fetch recipes' };
    }

    // Convert database records to Recipe objects
    const recipes = (result.results as DBRecipe[]).map(dbRecipe => ({
      ...dbRecipe,
      ingredients: JSON.parse(dbRecipe.ingredients) as string[],
      instructions: JSON.parse(dbRecipe.instructions) as string[]
    }));

    return { success: true, recipes };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recipes'
    };
  }
}

// Get a specific recipe by ID
export async function getRecipe(id: string): Promise<RecipeResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect(LOGIN_REDIRECT_URL);
    }

    const db = await getDb();
    const result = await db
      .prepare('SELECT * FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!result) {
      return { success: false, error: 'Recipe not found' };
    }

    const dbRecipe = result as DBRecipe;
    
    // Convert JSON strings to arrays
    const recipe: Recipe = {
      ...dbRecipe,
      ingredients: JSON.parse(dbRecipe.ingredients) as string[],
      instructions: JSON.parse(dbRecipe.instructions) as string[]
    };

    return { success: true, recipe };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recipe'
    };
  }
}

// Update a recipe
export async function updateRecipe(
  id: string,
  recipeUpdates: Partial<Recipe>
): Promise<RecipeResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect(LOGIN_REDIRECT_URL);
    }

    // Validate the recipe data
    const validatedData = UpdateRecipeSchema.parse(recipeUpdates);

    // Get the existing recipe to verify ownership
    const db = await getDb();
    const existingRecipe = await db
      .prepare('SELECT * FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!existingRecipe) {
      return { success: false, error: 'Recipe not found or you do not have permission to update it' };
    }

    // Prepare update fields and values
    const updates: Record<string, any> = {};
    const values: any[] = [];

    if (validatedData.title !== undefined) {
      updates.title = validatedData.title;
      values.push(validatedData.title);
    }

    if (validatedData.description !== undefined) {
      updates.description = validatedData.description;
      values.push(validatedData.description);
    }

    if (validatedData.preparationTime !== undefined) {
      updates.preparationTime = validatedData.preparationTime;
      values.push(validatedData.preparationTime);
    }

    if (validatedData.complexity !== undefined) {
      updates.complexity = validatedData.complexity;
      values.push(validatedData.complexity);
    }

    if (validatedData.ingredients !== undefined) {
      updates.ingredients = JSON.stringify(validatedData.ingredients);
      values.push(JSON.stringify(validatedData.ingredients));
    }

    if (validatedData.instructions !== undefined) {
      updates.instructions = JSON.stringify(validatedData.instructions);
      values.push(JSON.stringify(validatedData.instructions));
    }

    if (validatedData.image !== undefined) {
      updates.image = validatedData.image;
      values.push(validatedData.image);
    }

    // Add updatedAt timestamp
    const now = new Date().toISOString();
    updates.updatedAt = now;
    values.push(now);

    // Add id and userId for the WHERE clause
    values.push(id);
    values.push(userId);

    // Generate SET clause
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');

    // Execute the update
    const result = await db
      .prepare(
        `UPDATE recipes SET ${setClause} WHERE id = ? AND userId = ?`
      )
      .bind(...values)
      .run();

    if (!result.success) {
      console.error('Failed to update recipe:', result);
      return { success: false, error: 'Failed to update recipe' };
    }

    // Fetch the updated recipe
    return getRecipe(id);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recipe'
    };
  }
}

// Delete a recipe
export async function deleteRecipe(id: string): Promise<DeleteRecipeResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect(LOGIN_REDIRECT_URL);
    }

    const db = await getDb();
    
    // Verify ownership before deleting
    const existingRecipe = await db
      .prepare('SELECT id FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!existingRecipe) {
      return { success: false, error: 'Recipe not found or you do not have permission to delete it' };
    }

    // Delete the recipe
    const result = await db
      .prepare('DELETE FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .run();

    if (!result.success) {
      console.error('Failed to delete recipe:', result);
      return { success: false, error: 'Failed to delete recipe' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete recipe'
    };
  }
} 
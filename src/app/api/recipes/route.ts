import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateRecipeSchema } from '@/db/types';
import { getDb } from '@/db';
import { z } from 'zod';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = await getDb();
    const recipes = await db.prepare('SELECT * FROM recipes WHERE userId = ?')
      .bind(userId)
      .all();
    
    return NextResponse.json({ recipes: recipes.results });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// Schema for POST requests
export const PostSchema = CreateRecipeSchema;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = PostSchema.parse(body);
    
    const id = `recipe_${crypto.randomUUID().substring(0, 8)}`;
    const timestamp = new Date().toISOString();
    
    const db = await getDb();
    
    await db.prepare(`
      INSERT INTO recipes (
        id, userId, title, description, preparationTime, complexity, 
        ingredients, instructions, image, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      userId,
      validatedData.title,
      validatedData.description,
      validatedData.preparationTime,
      validatedData.complexity,
      JSON.stringify(validatedData.ingredients),
      JSON.stringify(validatedData.instructions),
      validatedData.image || null,
      timestamp,
      timestamp
    ).run();
    
    return NextResponse.json({ 
      success: true, 
      recipeId: id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
} 
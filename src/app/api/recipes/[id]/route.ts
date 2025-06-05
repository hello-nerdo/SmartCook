import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/db';
import { UpdateRecipeSchema } from '@/db/types';

// Get a specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const recipe = await db
      .prepare('SELECT * FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// Schema for DELETE requests
export const DeleteSchema = z.object({
  id: z.string(),
});

// Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // First check if recipe exists and belongs to user
    const recipe = await db
      .prepare('SELECT id FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Delete the recipe
    await db
      .prepare('DELETE FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}

// Schema for PUT requests
export const PutSchema = UpdateRecipeSchema;

// Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PutSchema.parse(body);

    const db = await getDb();

    // Check if recipe exists and belongs to user
    const recipe = await db
      .prepare('SELECT id FROM recipes WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Build the SET clause and parameters for the SQL query
    const updateFields = [];
    const bindParams = [];

    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);

        // Stringify arrays for ingredients and instructions
        if (key === 'ingredients' || key === 'instructions') {
          bindParams.push(JSON.stringify(value));
        } else {
          bindParams.push(value);
        }
      }
    }

    // Add updatedAt timestamp
    updateFields.push('updatedAt = ?');
    bindParams.push(new Date().toISOString());

    // Add id and userId for the WHERE clause
    bindParams.push(id);
    bindParams.push(userId);

    if (updateFields.length > 0) {
      const query = `
        UPDATE recipes 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND userId = ?
      `;

      await db
        .prepare(query)
        .bind(...bindParams)
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating recipe:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

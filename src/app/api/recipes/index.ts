import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { Recipe } from '@/lib/types/recipe';

import { CreateRecipeSchema } from '@/db/types';
import { saveRecipe } from '@/server/recipe-actions';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();

    try {
      // Validate with Zod schema
      CreateRecipeSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid recipe data', details: validationError },
        { status: 400 }
      );
    }

    const result = await saveRecipe(body as Recipe);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ recipe: result.recipe }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recipes:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

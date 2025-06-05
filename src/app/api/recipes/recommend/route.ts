import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Define PostSchema for request validation
const PostSchema = z.object({
  ingredients: z.array(z.string()).nonempty('Ingredients are required'),
  complexity: z.enum(['any', 'easy', 'medium', 'hard']).default('any'),
  prepTime: z.enum(['any', 'quick', 'medium', 'long']).default('any'),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: Request) {
  try {
    // Check authentication (optional, depending on your requirements)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body and validate with schema
    const body = await request.json();
    const validatedData = PostSchema.parse(body);
    const { ingredients, complexity, prepTime } = validatedData;

    // Format the ingredients for the prompt
    const ingredientsList = ingredients.join(', ');

    // Create complexity and prep time filters
    let complexityFilter = '';
    if (complexity && complexity !== 'any') {
      complexityFilter = `The recipes should be of ${complexity} complexity.`;
    }

    let timeFilter = '';
    if (prepTime && prepTime !== 'any') {
      const timeMap: Record<string, string> = {
        quick: 'under 30 minutes',
        medium: 'between 30 and 60 minutes',
        long: 'over 60 minutes',
      };
      timeFilter = `The recipes should take ${timeMap[prepTime]} to prepare.`;
    }

    // Create the prompt for OpenAI
    const prompt = `
      Generate 3 creative, chef-quality recipes using only these ingredients: ${ingredientsList}.
      ${complexityFilter}
      ${timeFilter}
      For each recipe, provide:
      1. A descriptive title
      2. A brief description that highlights the main flavors
      3. Preparation time
      4. Complexity level (easy, medium, or hard)
      5. List of ingredients with measurements
      6. Step-by-step cooking instructions
      7. A suggested image URL that would represent this dish

      Format the response as a valid JSON array with objects containing the following fields:
      title, description, preparationTime, complexity, ingredients (array), instructions (array), image (URL string)
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional chef specialized in creating delicious recipes from available ingredients. You excel at suggesting creative combinations and clear instructions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    let recipes;

    try {
      // Clean the content by removing markdown code block formatting if present
      let cleanedContent = content || '[]';

      // Remove markdown code block markers if they exist
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/, '');
        cleanedContent = cleanedContent.replace(/\s*```\s*$/, '');
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/, '');
        cleanedContent = cleanedContent.replace(/\s*```\s*$/, '');
      }

      // Attempt to parse the JSON response
      recipes = JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response as JSON:', error);
      // If parsing fails, create a structured response manually
      recipes = [
        {
          title: 'Error generating recipes',
          description:
            'We encountered an issue generating recipes. Please try again later.',
          preparationTime: 'N/A',
          complexity: 'N/A',
          ingredients: ['Could not generate recipe'],
          instructions: ['Could not generate instructions'],
          image: 'https://via.placeholder.com/400x300?text=Recipe+Unavailable',
        },
      ];
    }

    // Return the recipes
    return NextResponse.json({ recipes });
  } catch (error) {
    // Check if it's a Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in recipe recommendation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe recommendations' },
      { status: 500 }
    );
  }
}

'use client';

import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';

import { pathToRecipes } from '@/lib/constants';
import { Recipe } from '@/lib/types/recipe';

export default function RecipeDetailPage() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Get recipe from sessionStorage
    const storedRecipe = sessionStorage.getItem('selectedRecipe');
    if (storedRecipe) {
      try {
        setRecipe(JSON.parse(storedRecipe));
      } catch (error) {
        console.error('Error parsing recipe:', error);
      }
    }
  }, []);

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    setSaving(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          preparationTime: recipe.preparationTime,
          complexity: recipe.complexity,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          image: recipe.image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      setSaveSuccess(true);

      // Clear save success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-charcoal-600">Recipe not found</p>
          <button
            onClick={() => router.push('/core')}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {recipe.image && (
          <div className="h-64 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-charcoal-800 mb-4">
            {recipe.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              {recipe.preparationTime}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {recipe.complexity}
            </span>
          </div>

          <p className="text-charcoal-600 mb-6">{recipe.description}</p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal-800 mb-3">
              Ingredients
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {recipe.ingredients?.map((ingredient, index) => (
                <li key={index} className="text-charcoal-600">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal-800 mb-3">
              Instructions
            </h2>
            <ol className="list-decimal pl-6 space-y-4">
              {recipe.instructions?.map((step, index) => (
                <li key={index} className="text-charcoal-600">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => router.push('/core')}
              className="bg-gray-200 text-charcoal-800 hover:bg-gray-300 rounded-lg px-6 py-2 font-semibold"
            >
              Back
            </button>

            <button
              onClick={handleSaveRecipe}
              disabled={saving || saveSuccess}
              className={`${
                saving || saveSuccess
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } rounded-lg px-6 py-2 font-semibold flex items-center`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-b-white/50 border-l-white/50 border-r-white/50 rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Recipe'
              )}
            </button>
          </div>

          {saveSuccess && (
            <div className="mt-4 bg-green-100 text-green-800 p-3 rounded-lg text-center">
              Recipe saved successfully! View your saved recipes{' '}
              <button
                onClick={() => router.push(pathToRecipes())}
                className="underline font-semibold"
              >
                here
              </button>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

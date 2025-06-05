'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';

import { pathToRecipes } from '@/lib/constants';
import { Recipe } from '@/lib/types/recipe';

interface RecipeResponse {
  recipe: Recipe;
}

export default function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        // Get the recipe ID from the URL params
        const { id } = await params;

        if (!id) {
          throw new Error('Recipe ID is missing');
        }

        const response = await fetch(`/api/recipes/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Recipe not found');
          } else {
            throw new Error('Failed to fetch recipe');
          }
        }

        const data = (await response.json()) as RecipeResponse;
        setRecipe(data.recipe);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [params]);

  async function handleDeleteRecipe() {
    if (
      !recipe?.id ||
      !window.confirm('Are you sure you want to delete this recipe?')
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // Redirect to recipes page after successful deletion
      router.push(pathToRecipes());
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-b-orange-300 border-l-orange-300 border-r-orange-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-charcoal-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="w-full max-w-4xl p-6 mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-charcoal-800 mb-4">
            Recipe Not Found
          </h1>
          <p className="text-charcoal-600 mb-6">
            {error || "The recipe you're looking for could not be found."}
          </p>
          <Link
            href={pathToRecipes()}
            className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-6 py-2 font-semibold"
          >
            Back to My Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 mx-auto">
      <Link
        href={pathToRecipes()}
        className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 010 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to My Recipes
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {recipe.image && (
          <div className="w-full h-64 sm:h-80 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-charcoal-800">
              {recipe.title}
            </h1>
            <button
              onClick={handleDeleteRecipe}
              className="text-red-600 hover:text-red-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              {recipe.preparationTime}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {recipe.complexity}
            </span>
          </div>

          <p className="text-charcoal-600 mb-8 text-lg">{recipe.description}</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-charcoal-800">
                Ingredients
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-charcoal-800 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-charcoal-800">{servings} servings</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-charcoal-800 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-charcoal-600">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-charcoal-800 mb-4">
              Instructions
            </h2>
            <ol className="list-decimal pl-6 space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="text-charcoal-600">
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

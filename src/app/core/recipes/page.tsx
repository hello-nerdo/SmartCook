'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import React, { useEffect, useState } from 'react';

import { pathToRecipe } from '@/lib/constants';
import { Recipe } from '@/lib/types/recipe';

interface RecipesResponse {
  recipes: Recipe[];
}

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch('/api/recipes');

        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const data = (await response.json()) as RecipesResponse;
        setRecipes(data.recipes || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  async function handleDeleteRecipe(id: string) {
    if (
      !id ||
      !window.confirm('Are you sure you want to delete this recipe?')
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // Filter out the deleted recipe
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
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
          <p className="mt-4 text-charcoal-600">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl p-6 mx-auto">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-800 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 mx-auto">
      <h1 className="text-3xl font-bold text-charcoal-800 mb-8">
        My Saved Recipes
      </h1>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-charcoal-800 mb-4">
            No Recipes Yet
          </h2>
          <p className="text-charcoal-600 mb-6">
            You haven&apos;t saved any recipes yet. Discover new recipes and
            save them to your collection!
          </p>
          <Link
            href="/core"
            className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-6 py-2 font-semibold"
          >
            Find Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {recipe.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-charcoal-800 mb-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {recipe.preparationTime}
                  </span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {recipe.complexity}
                  </span>
                </div>
                <p className="text-charcoal-600 mb-4">{recipe.description}</p>
                <div className="flex justify-between">
                  <Link
                    href={pathToRecipe(recipe.id!)}
                    className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-4 py-2 font-semibold"
                  >
                    View Recipe
                  </Link>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id!)}
                    className="bg-white text-red-600 border border-red-600 hover:bg-red-50 rounded-lg px-4 py-2 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Recipe, RecipeResponse, ComplexityLevel, PrepTime } from '@/lib/types/recipe';

export default function RecipeRecommendationPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [complexity, setComplexity] = useState<ComplexityLevel>('any');
  const [prepTime, setPrepTime] = useState<PrepTime>('any');

  const handleAddIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    try {
      // This is a placeholder. In a real implementation, you'd call an API endpoint
      // that would use OpenAI or another service to generate recipes
      const response = await fetch('/api/recipes/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          complexity,
          prepTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe recommendations');
      }

      const data = await response.json() as RecipeResponse;
      setRecipes(data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    // In a production app, we would use a proper data store like Redux or Context
    // For this example, we'll use sessionStorage to pass data between pages
    sessionStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    router.push('/core/recipe');
  };

  return (
    <div className="w-full max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-center text-charcoal-800 mb-8">
        Find Recipes With Your Ingredients
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="ingredients" className="block text-charcoal-700 text-sm font-semibold mb-2">
            Add your available ingredients:
          </label>
          <div className="flex">
            <input
              type="text"
              id="ingredients"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter an ingredient (e.g., chicken, tomatoes, rice)"
              className="flex-grow bg-white border border-gray-200 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
            <button
              onClick={handleAddIngredient}
              className="bg-orange-500 text-white hover:bg-orange-600 rounded-r-lg px-4 py-2 font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-charcoal-700 mb-2">Your ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{ingredient}</span>
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-2 text-orange-800 hover:text-orange-900"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="complexity" className="block text-charcoal-700 text-sm font-semibold mb-2">
              Recipe Complexity:
            </label>
            <select
              id="complexity"
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="any">Any Complexity</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="prepTime" className="block text-charcoal-700 text-sm font-semibold mb-2">
              Preparation Time:
            </label>
            <select
              id="prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value as PrepTime)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="any">Any Time</option>
              <option value="quick">Quick (under 30 min)</option>
              <option value="medium">Medium (30-60 min)</option>
              <option value="long">Long (over 60 min)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGetRecipes}
          disabled={ingredients.length === 0 || loading}
          className={`w-full rounded-lg py-3 font-semibold ${
            ingredients.length === 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {loading ? 'Finding Recipes...' : 'Find Recipes'}
        </button>
      </div>

      {recipes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-charcoal-800 mb-4">Recipe Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={index}
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
                  <h3 className="text-xl font-semibold text-charcoal-800 mb-2">{recipe.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{recipe.preparationTime}</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {recipe.complexity}
                    </span>
                  </div>
                  <p className="text-charcoal-600 mb-4">{recipe.description}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewRecipe(recipe);
                    }}
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-4 py-2 font-semibold"
                  >
                    View Recipe
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

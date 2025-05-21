'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Recipe } from '@/lib/types/recipe';

export default function RecipeDetailPage() {
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  
  useEffect(() => {
    // In a real application, you would fetch the recipe details from an API
    // using the recipeId from the URL params
    const recipeData = sessionStorage.getItem('selectedRecipe');
    
    if (recipeData) {
      try {
        setRecipe(JSON.parse(recipeData));
      } catch (error) {
        console.error('Error parsing recipe data:', error);
      }
    }
    
    setLoading(false);
  }, []);

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

  if (!recipe) {
    return (
      <div className="w-full max-w-4xl p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-charcoal-800 mb-4">Recipe Not Found</h1>
          <p className="text-charcoal-600 mb-6">The recipe you're looking for could not be found.</p>
          <Link 
            href="/core" 
            className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-6 py-2 font-semibold"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6">
      <Link 
        href="/core" 
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
        Back to Recipes
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
          <h1 className="text-3xl font-bold text-charcoal-800 mb-2">{recipe.title}</h1>
          
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
              <h2 className="text-2xl font-bold text-charcoal-800">Ingredients</h2>
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
                <li key={index} className="text-charcoal-600">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-charcoal-800 mb-4">Instructions</h2>
            <ol className="list-decimal pl-6 space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="text-charcoal-600">
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="flex justify-center mt-8">
            <button className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-8 py-3 font-semibold">
              Save Recipe
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
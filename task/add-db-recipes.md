# Task: Implement Recipe Persistence with Cloudflare D1

## Overview
Create a database-backed persistence layer for user recipes in SmartCook using Cloudflare D1. Users should be able to save recipes they've discovered through the app and retrieve them later.

## Background
Currently, the app suggests recipes based on user ingredients, but there's no way to save favorites. When a user views a recipe detail page, the "Save Recipe" button is non-functional. We need to implement this feature to improve the user experience.

## Requirements

### Database Schema
- Create a new `recipes` table with the following schema:
  - `id`: Unique identifier (auto-generated)
  - `userId`: ID of the user (from Clerk Auth)
  - `title`: Recipe title
  - `description`: Brief description
  - `preparationTime`: Preparation time (quick, medium, long)
  - `complexity`: Complexity level (easy, medium, hard)
  - `ingredients`: JSON array of ingredients with measurements
  - `instructions`: JSON array of step-by-step instructions
  - `image`: Optional URL to recipe image
  - `createdAt`: Timestamp when recipe was saved
  - `updatedAt`: Timestamp when recipe was last updated

### API Endpoints
Create the following API endpoints:
- `POST /api/recipes` - Save a new recipe
- `GET /api/recipes` - Get all recipes for the current user
- `GET /api/recipes/:id` - Get a specific recipe
- `DELETE /api/recipes/:id` - Delete a saved recipe
- `PUT /api/recipes/:id` - Update a saved recipe

### Frontend Integration
- Update the recipe detail page to use the "Save Recipe" button
- Create a "My Recipes" page to display saved recipes

## Technical Approach

### Cloudflare D1 Integration
- Use the existing `getDb()` function from `/src/db/index.ts`
- Follow the pattern used in the photos table implementation

### Authentication
- Use Clerk Auth to get the current user ID
- Secure all endpoints to ensure users can only access their own recipes

### Server-Side Actions
- Create server actions for CRUD operations on recipes
- Ensure proper error handling and validation

### Data Types
- Define a proper `Recipe` type in `/src/lib/types/recipe.ts`
- Create a Zod schema for validation in `/src/db/types.ts`

## Security Considerations
- Validate all inputs using Zod schemas
- Ensure users can only access their own recipes
- Sanitize any user-generated content

## Success Criteria
- Users can save recipes they discover
- Users can view a list of their saved recipes
- Users can remove saved recipes they no longer want
- The solution performs well with minimal latency
- The implementation follows SmartCook's established patterns

## Future Considerations
- Recipe categorization/tagging
- Recipe sharing functionality
- Integration with meal planning feature
- Ingredients shopping list generation

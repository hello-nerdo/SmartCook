export const HOME_OG_IMAGE_URL =
  'https://smart-cook.jmarais.workers.dev/og-image.png';

export const LOGIN_REDIRECT_URL = '/auth/login';

// Workspace paths
export const pathToRoot = () => '/';
export const pathToCore = () => '/core';
export const pathToRecipes = () => '/core/recipes';
export const pathToRecipe = (id: string) => `/core/recipes/${id}`;
export const pathToProfile = () => '/core/profile';
export const pathToSettings = () => '/core/settings';

// API paths
export const apiPathToRecipes = () => '/api/recipes';
export const apiPathToRecipe = (id: string) => `/api/recipes/${id}`;
export const apiPathToRecommend = () => '/api/recipes/recommend';

// Recipe Urls
export const pathToCreateRecipe = '/core/recipes/new';
export const pathToEditRecipe = (id: string) => `/core/recipes/${id}/edit`;

import { create } from 'zustand';
import { categoryService } from '../services/categories';
import { foodService } from '../services/foods';

const normalizeEntity = (item) => {
  if (!item) {
    return null;
  }

  const id = item.id || item._id;
  if (!id) {
    return null;
  }

  return { ...item, id };
};

const normalizeList = (items = []) =>
  items
    .map(normalizeEntity)
    .filter(Boolean);

const buildStats = (foods, categories) => {
  const totalFoods = foods.length;
  const totalCategories = categories.length;
  const availableFoods = foods.filter((food) => food.isAvailable !== false).length;
  const outOfStockFoods = totalFoods - availableFoods;

  return {
    totalFoods,
    totalCategories,
    availableFoods,
    outOfStockFoods
  };
};

export const useKitchenStore = create((set, get) => ({
  foods: [],
  categories: [],
  stats: {
    totalFoods: 0,
    totalCategories: 0,
    availableFoods: 0,
    outOfStockFoods: 0
  },
  isLoading: true,
  error: null,

  fetchKitchenData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use allSettled so a failing foods request doesn't block categories from loading
      const [foodsResult, categoriesResult] = await Promise.allSettled([
        foodService.getFoods(),
        categoryService.getCategories('all')
      ]);

      const foodsResponse = foodsResult.status === 'fulfilled' ? foodsResult.value : null;
      const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;

      // Backend returns { success, data: [...] } — extract the array
      const rawFoods = Array.isArray(foodsResponse?.data)
        ? foodsResponse.data
        : Array.isArray(foodsResponse)
          ? foodsResponse
          : [];

      const rawCategories = Array.isArray(categoriesResponse?.data)
        ? categoriesResponse.data
        : Array.isArray(categoriesResponse)
          ? categoriesResponse
          : [];

      const foods = normalizeList(rawFoods);
      const categories = normalizeList(rawCategories);
      const stats = buildStats(foods, categories);

      // Surface an error if categories specifically failed (main bug trigger)
      const categoriesError =
        categoriesResult.status === 'rejected'
          ? categoriesResult.reason?.message || 'Failed to load categories.'
          : null;

      set({
        foods,
        categories,
        stats,
        isLoading: false,
        error: categoriesError
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || 'Unable to load kitchen data.'
      });
    }
  },

  upsertFood: (food) => {
    const normalized = normalizeEntity(food);

    if (!normalized) {
      return;
    }

    set((state) => {
      const foods = state.foods.some((item) => item.id === normalized.id)
        ? state.foods.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...state.foods];

      return {
        foods,
        stats: buildStats(foods, state.categories)
      };
    });
  },

  removeFood: (foodId) => {
    set((state) => {
      const foods = state.foods.filter((item) => item.id !== foodId);
      return {
        foods,
        stats: buildStats(foods, state.categories)
      };
    });
  },

  updateFoodAvailability: (foodId, isAvailable) => {
    set((state) => {
      const foods = state.foods.map((item) =>
        item.id === foodId ? { ...item, isAvailable } : item
      );

      return {
        foods,
        stats: buildStats(foods, state.categories)
      };
    });
  },

  upsertCategory: (category) => {
    const normalized = normalizeEntity(category);

    if (!normalized) {
      return;
    }

    set((state) => {
      const categories = state.categories.some((item) => item.id === normalized.id)
        ? state.categories.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...state.categories];

      return {
        categories,
        stats: buildStats(state.foods, categories)
      };
    });
  },

  removeCategory: (categoryId) => {
    set((state) => {
      const categories = state.categories.filter((item) => item.id !== categoryId);
      return {
        categories,
        stats: buildStats(state.foods, categories)
      };
    });
  }
}));

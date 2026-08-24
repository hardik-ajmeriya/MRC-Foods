import { create } from 'zustand';
import { homeApi } from '../services/api';
import { resolveFoodImage } from '../utils/resolveImage';

const CART_STORAGE_KEY = 'mrc-foods-cart';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const EVENTS_ENDPOINT = `${API_BASE_URL.replace(/\/$/, '')}/events`;

let realtimeSource = null;

const safeParse = (payload) => {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

const getStoredCart = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return {};
    }

    const parsedCart = JSON.parse(rawCart);
    return parsedCart && typeof parsedCart === 'object' ? parsedCart : {};
  } catch {
    return {};
  }
};

const persistCart = (cart) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const normalizeCategoryId = (value) => {
  if (!value) {
    return '';
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return '';
  }

  const isMongoId = /^[a-f0-9]{24}$/i.test(normalized);
  if (isMongoId || !normalized.includes(' ')) {
    return normalized;
  }

  return normalized.toLowerCase().replace(/\s+/g, '-');
};

const normalizeCategory = (category) => {
  const rawId = category?._id || category?.id || category?.slug || category?.name;
  const resolvedId = normalizeCategoryId(rawId);

  return {
    id: resolvedId || normalizeCategoryId(category?.name),
    name: category?.name || 'Category',
    icon: category?.icon || category?.image || null,
    image: category?.image || category?.icon || null,
    isActive: category?.isActive !== false
  };
};

const deriveCategoriesFromFoods = (foods) => {
  const map = new Map();

  foods.forEach((food) => {
    if (!food?.categoryName) {
      return;
    }

    const id = normalizeCategoryId(food.categoryId || food.categoryName);
    if (!id || map.has(id)) {
      return;
    }

    map.set(id, {
      id,
      name: food.categoryName,
      icon: null
    });
  });

  return Array.from(map.values());
};

const mergeCategories = (primary, secondary) => {
  const map = new Map();

  primary.forEach((category) => {
    if (category?.id) {
      map.set(String(category.id), category);
    }
  });

  secondary.forEach((category) => {
    if (!category?.id) {
      return;
    }

    const key = String(category.id);
    if (!map.has(key)) {
      map.set(key, category);
    }
  });

  return Array.from(map.values());
};

const resolveIsVeg = (food) => {
  const rawType = String(food?.type || '').trim().toLowerCase();

  if (rawType === 'veg') {
    return true;
  }

  if (rawType === 'non-veg' || rawType === 'nonveg') {
    return false;
  }

  if (typeof food?.isVeg === 'boolean') {
    return food.isVeg;
  }

  return true;
};

const resolveIsAvailable = (food) => {
  if (typeof food?.isAvailable === 'boolean') {
    return food.isAvailable;
  }

  if (food?.isAvailable === undefined || food?.isAvailable === null) {
    return true;
  }

  const normalized = String(food.isAvailable).trim().toLowerCase();
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }

  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }

  return true;
};

const normalizeFood = (food) => {
  const category = food?.category;
  const categoryValue =
    typeof category === 'object'
      ? category?._id || category?.id || category?.slug || category?.name
      : category;
  const categoryName =
    typeof category === 'object'
      ? category?.name || ''
      : String(category || '').trim();
  const categoryId = normalizeCategoryId(categoryValue || categoryName);
  const resolvedImage = resolveFoodImage({
    image: food?.image,
    categoryId,
    categoryName
  });

  return {
    id: food?._id || food?.id,
    name: food?.name || 'Untitled Item',
    description: food?.description || '',
    price: Number(food?.price) || 0,
    rating: Number(food?.rating) || 4.2,
    image: resolvedImage || null,
    isVeg: resolveIsVeg(food),
    isAvailable: resolveIsAvailable(food),
    categoryId,
    categoryName,
    prepTime: food?.prepTime || ''
  };
};

const upsertFoodInState = (state, payload) => {
  const normalized = normalizeFood(payload);

  if (!normalized?.id) {
    return state;
  }

  const exists = state.foods.some((item) => item.id === normalized.id);
  const foods = exists
    ? state.foods.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...state.foods];

  return { ...state, foods };
};

const removeFoodFromState = (state, foodId) => {
  if (!foodId) {
    return state;
  }

  const foods = state.foods.filter((item) => item.id !== foodId);
  const cart = { ...state.cart };

  if (cart[foodId]) {
    delete cart[foodId];
    persistCart(cart);
  }

  return { ...state, foods, cart };
};

const upsertCategoryInState = (state, payload) => {
  const normalized = normalizeCategory(payload);

  if (!normalized?.id) {
    return state;
  }

  const existing = state.categories.filter((item) => item.id !== normalized.id);
  const categories = normalized.isActive !== false ? [normalized, ...existing] : existing;

  return { ...state, categories };
};

const removeCategoryFromState = (state, categoryId) => {
  if (!categoryId) {
    return state;
  }

  const categories = state.categories.filter((item) => item.id !== categoryId);
  return { ...state, categories };
};

export const useFoodStore = create((set, get) => ({
  foods: [],
  categories: [],
  activeCategory: 'all',
  searchQuery: '',
  isLoading: true,
  isRefreshing: false,
  hasFetched: false,
  error: null,
  cart: getStoredCart(),
  realtimeStatus: 'idle',

  setActiveCategory: (categoryId) => {
    set({ activeCategory: categoryId });
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  addToCart: (foodId) => {
    set((state) => {
      if (!foodId) {
        return state;
      }

      const updatedCart = {
        ...state.cart,
        [foodId]: (state.cart[foodId] || 0) + 1
      };

      persistCart(updatedCart);
      return { cart: updatedCart };
    });
  },

  removeFromCart: (foodId) => {
    set((state) => {
      if (!foodId || !state.cart[foodId]) {
        return state;
      }

      const updatedCart = { ...state.cart };

      if (updatedCart[foodId] <= 1) {
        delete updatedCart[foodId];
      } else {
        updatedCart[foodId] -= 1;
      }

      persistCart(updatedCart);
      return { cart: updatedCart };
    });
  },

  startRealtime: () => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    if (realtimeSource) {
      return;
    }

    const source = new EventSource(EVENTS_ENDPOINT);
    realtimeSource = source;

    set({ realtimeStatus: 'connecting' });

    source.onopen = () => {
      set({ realtimeStatus: 'connected' });
    };

    source.onerror = () => {
      set({ realtimeStatus: 'error' });
    };

    source.addEventListener('food-created', (event) => {
      const payload = safeParse(event.data);
      if (!payload?.food) {
        return;
      }

      set((state) => upsertFoodInState(state, payload.food));
    });

    source.addEventListener('food-updated', (event) => {
      const payload = safeParse(event.data);
      if (!payload?.food) {
        return;
      }

      set((state) => upsertFoodInState(state, payload.food));
    });

    source.addEventListener('food-availability', (event) => {
      const payload = safeParse(event.data);
      if (!payload?.food) {
        return;
      }

      set((state) => upsertFoodInState(state, payload.food));
    });

    source.addEventListener('food-deleted', (event) => {
      const payload = safeParse(event.data);
      const foodId = payload?.id || payload?.foodId;

      if (!foodId) {
        return;
      }

      set((state) => removeFoodFromState(state, foodId));
    });

    source.addEventListener('category-created', (event) => {
      const payload = safeParse(event.data);
      if (!payload?.category) {
        return;
      }

      set((state) => upsertCategoryInState(state, payload.category));
    });

    source.addEventListener('category-updated', (event) => {
      const payload = safeParse(event.data);
      if (!payload?.category) {
        return;
      }

      set((state) => upsertCategoryInState(state, payload.category));
    });

    source.addEventListener('category-deleted', (event) => {
      const payload = safeParse(event.data);
      const categoryId = payload?.id || payload?.categoryId;

      if (!categoryId) {
        return;
      }

      set((state) => removeCategoryFromState(state, categoryId));
    });
  },

  stopRealtime: () => {
    if (!realtimeSource) {
      return;
    }

    realtimeSource.close();
    realtimeSource = null;
    set({ realtimeStatus: 'idle' });
  },

  fetchHomeData: async ({ refresh = false } = {}) => {
    const hasFetched = get().hasFetched;
    const showSkeleton = !hasFetched && !refresh;

    set({
      isLoading: showSkeleton,
      isRefreshing: !showSkeleton,
      error: null
    });

    try {
      const [foodsResponse, categoriesResponse] = await Promise.all([
        homeApi.getFoods(),
        homeApi.getCategories()
      ]);

      const normalizedCategories = categoriesResponse
        .map(normalizeCategory)
        .filter((category) => category.isActive !== false);
      const foods = foodsResponse.map(normalizeFood).filter((food) => Boolean(food.id));
      const derivedCategories =
        normalizedCategories.length === 0 ? deriveCategoriesFromFoods(foods) : [];
      const categories =
        normalizedCategories.length > 0
          ? normalizedCategories
          : mergeCategories(normalizedCategories, derivedCategories);

      const currentCategory = get().activeCategory;
      const isCurrentCategoryValid =
        currentCategory === 'all' ||
        categories.some((category) => category.id === currentCategory);

      set({
        foods,
        categories,
        activeCategory: isCurrentCategoryValid ? currentCategory : 'all',
        isLoading: false,
        isRefreshing: false,
        hasFetched: true,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        isRefreshing: false,
        hasFetched: true,
        error: error.message || 'Failed to load menu data.'
      });
    }
  }
}));

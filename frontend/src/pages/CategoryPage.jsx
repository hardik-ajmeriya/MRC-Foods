import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import CategoryBar from '../components/CategoryBar';
import EmptyState from '../components/EmptyState';
import FoodGrid from '../components/FoodGrid';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useFoodStore } from '../store/useFoodStore';
import { resolveFoodImage } from '../utils/resolveImage';
import { slugify } from '../utils/slugify';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const canManageKitchen = user?.role === 'staff' || user?.role === 'admin';

  const foods = useFoodStore((state) => state.foods);
  const categories = useFoodStore((state) => state.categories);
  const isLoading = useFoodStore((state) => state.isLoading);
  const isRefreshing = useFoodStore((state) => state.isRefreshing);
  const hasFetched = useFoodStore((state) => state.hasFetched);
  const error = useFoodStore((state) => state.error);
  const cart = useFoodStore((state) => state.cart);
  const fetchHomeData = useFoodStore((state) => state.fetchHomeData);
  const addToCart = useFoodStore((state) => state.addToCart);
  const removeFromCart = useFoodStore((state) => state.removeFromCart);

  const [searchQuery, setSearchQuery] = useState('');
  const categorySlug = slugify(categoryName);

  useEffect(() => {
    if (!hasFetched) {
      fetchHomeData();
    }
  }, [hasFetched, fetchHomeData]);

  useEffect(() => {
    setSearchQuery('');
  }, [categorySlug]);



  const activeCategory = useMemo(
    () => categories.find((category) => slugify(category.name) === categorySlug),
    [categories, categorySlug]
  );

  const categoryPills = useMemo(
    () =>
      categories.map((category) => ({
        id: slugify(category.name),
        name: category.name,
        icon: resolveFoodImage({
          image: category.image || category.icon,
          categoryName: category.name,
          categoryId: category.id
        })
      })),
    [categories]
  );

  const filteredFoods = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return foods.filter((food) => {
      const foodCategorySlug = slugify(food.categoryName || food.categoryId || food.category);

      if (foodCategorySlug !== categorySlug) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchTarget = [food.name, food.description, food.categoryName]
        .join(' ')
        .toLowerCase();

      return searchTarget.includes(normalizedSearch);
    });
  }, [foods, searchQuery, categorySlug]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((totalItems, quantity) => totalItems + quantity, 0),
    [cart]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleKitchenDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleBackToCategories = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSelectCategory = useCallback(
    (nextSlug) => {
      if (!nextSlug) {
        return;
      }

      navigate(`/category/${nextSlug}`);
    },
    [navigate]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleAddToCart = useCallback(
    (foodId) => {
      addToCart(foodId);
    },
    [addToCart]
  );

  const handleRemoveFromCart = useCallback(
    (foodId) => {
      removeFromCart(foodId);
    },
    [removeFromCart]
  );

  const handleViewDetails = useCallback(
    (food) => {
      if (!food?.id) {
        return;
      }

      navigate(`/food/${food.id}`);
    },
    [navigate]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(130%_100%_at_50%_0%,rgba(252,128,25,0.2),transparent_70%)]" />

      <Header
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLogin={handleLogin}
        showDashboard={canManageKitchen}
        onDashboard={handleKitchenDashboard}
        dashboardIcon={LayoutGrid}
      />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBackToCategories}
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-brand-200 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Back to categories
          </button>
          {activeCategory ? (
            <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              {activeCategory.name}
            </div>
          ) : null}
        </div>

        {categoryPills.length > 0 ? (
          <CategoryBar
            categories={categoryPills}
            activeCategory={categorySlug}
            onSelectCategory={handleSelectCategory}
          />
        ) : null}

        <SearchBar
          value={searchQuery}
          onDebouncedChange={handleSearchChange}
          disabled={isLoading && foods.length === 0}
        />

        {isRefreshing ? (
          <div className="mb-3 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            Updating menu
          </div>
        ) : null}

        {error ? (
          <EmptyState
            variant="error"
            title="Unable to load menu"
            subtitle="We could not fetch the latest food items. Please try again."
            onRefresh={() => fetchHomeData({ refresh: true })}
          />
        ) : null}

        {!error && isLoading ? <SkeletonLoader /> : null}

        {!error && !isLoading && !activeCategory ? (
          <EmptyState
            variant="error"
            title="Category not found"
            subtitle="This category is unavailable. Browse all categories instead."
            actionLabel="Browse categories"
            onRefresh={handleBackToCategories}
          />
        ) : null}

        {!error && !isLoading && activeCategory && filteredFoods.length === 0 ? (
          <EmptyState
            title={`No items in ${activeCategory.name}`}
            subtitle="Items will appear here when added"
            onRefresh={() => fetchHomeData({ refresh: true })}
          />
        ) : null}

        {!error && !isLoading && filteredFoods.length > 0 ? (
          <FoodGrid
            items={filteredFoods}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onViewDetails={handleViewDetails}
          />
        ) : null}
      </main>

      <BottomNav cartCount={cartCount} />
    </div>
  );
};

export default CategoryPage;

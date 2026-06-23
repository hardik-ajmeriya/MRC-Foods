import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import CategoryGrid from '../components/CategoryGrid';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useFoodStore } from '../store/useFoodStore';
import { slugify } from '../utils/slugify';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const canManageKitchen = user?.role === 'staff' || user?.role === 'admin';

  const categories = useFoodStore((state) => state.categories);
  const cart = useFoodStore((state) => state.cart);
  const isLoading = useFoodStore((state) => state.isLoading);
  const isRefreshing = useFoodStore((state) => state.isRefreshing);
  const error = useFoodStore((state) => state.error);
  const fetchHomeData = useFoodStore((state) => state.fetchHomeData);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

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

  const handleRefresh = useCallback(() => {
    fetchHomeData({ refresh: true });
  }, [fetchHomeData]);

  const handleSelectCategory = useCallback(
    (category) => {
      const slug = slugify(category?.name || category?.id);
      if (!slug) {
        return;
      }
      navigate(`/category/${slug}`);
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
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Browse categories
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a category to explore the latest menu offerings.
          </p>
        </div>

        {isRefreshing ? (
          <div className="mb-3 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            Updating menu
          </div>
        ) : null}

        {error ? (
          <EmptyState
            variant="error"
            title="Unable to load categories"
            subtitle="Please try again in a moment."
            onRefresh={handleRefresh}
          />
        ) : null}

        {!error && isLoading ? <SkeletonLoader /> : null}

        {!error && !isLoading && categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            subtitle="Categories will appear here once the kitchen team adds them."
            onRefresh={handleRefresh}
          />
        ) : null}

        {!error && !isLoading && categories.length > 0 ? (
          <CategoryGrid categories={categories} onSelect={handleSelectCategory} />
        ) : null}
      </main>

      <BottomNav cartCount={cartCount} />
    </div>
  );
};

export default Home;

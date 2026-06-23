import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Minus, Plus, Star, UtensilsCrossed } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import { useAuth } from '../features/auth/hooks/useAuth';
import { foodService } from '../services/foods';
import { useFoodStore } from '../store/useFoodStore';
import { resolveFoodImage } from '../utils/resolveImage';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const canManageKitchen = user?.role === 'staff' || user?.role === 'admin';

  const foods = useFoodStore((state) => state.foods);
  const cart = useFoodStore((state) => state.cart);
  const addToCart = useFoodStore((state) => state.addToCart);
  const removeFromCart = useFoodStore((state) => state.removeFromCart);

  const [food, setFood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const storedFood = useMemo(
    () => foods.find((item) => item.id === id),
    [foods, id]
  );

  useEffect(() => {
    if (storedFood) {
      setFood(storedFood);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchFood = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await foodService.getFood(id);
        if (isMounted) {
          setFood(response?.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Unable to load food item.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFood();

    return () => {
      isMounted = false;
    };
  }, [id, storedFood]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((totalItems, quantity) => totalItems + quantity, 0),
    [cart]
  );

  const foodId = food?.id || food?._id || id;
  const quantity = cart[foodId] || 0;
  const categoryLabel = food?.categoryName || food?.category || '';
  const resolvedImage = resolveFoodImage({
    image: food?.image,
    categoryId: categoryLabel,
    categoryName: categoryLabel
  });

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

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleAddToCart = useCallback(() => {
    if (foodId) {
      addToCart(foodId);
    }
  }, [foodId, addToCart]);

  const handleRemoveFromCart = useCallback(() => {
    if (foodId) {
      removeFromCart(foodId);
    }
  }, [foodId, removeFromCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface text-slate-900">
        <Header
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onLogin={handleLogin}
          showDashboard={canManageKitchen}
          onDashboard={handleKitchenDashboard}
          dashboardIcon={LayoutGrid}
        />
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16">
          <div className="text-sm text-slate-500">Loading item...</div>
        </div>
      </div>
    );
  }

  if (!food || error) {
    return (
      <div className="min-h-screen bg-surface text-slate-900">
        <Header
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onLogin={handleLogin}
          showDashboard={canManageKitchen}
          onDashboard={handleKitchenDashboard}
          dashboardIcon={LayoutGrid}
        />
        <div className="mx-auto w-full max-w-4xl px-4 py-12">
          <EmptyState
            variant="error"
            title="Food item not found"
            subtitle={error || 'This item is no longer available.'}
            actionLabel="Go back"
            onRefresh={handleBack}
          />
        </div>
      </div>
    );
  }

  const isUnavailable = food.isAvailable === false;

  return (
    <div className="relative min-h-screen bg-surface text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(130%_100%_at_50%_0%,rgba(252,128,25,0.2),transparent_70%)]" />

      <Header
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLogin={handleLogin}
        showDashboard={canManageKitchen}
        onDashboard={handleKitchenDashboard}
        dashboardIcon={LayoutGrid}
      />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-brand-200 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back
        </button>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="relative aspect-[4/3] bg-slate-100">
              {resolvedImage ? (
                <img
                  src={resolvedImage}
                  alt={food.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <UtensilsCrossed className="h-10 w-10" strokeWidth={1.6} />
                </div>
              )}

              {isUnavailable ? (
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-3 py-2 text-center text-xs font-semibold text-white">
                  Currently unavailable
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{food.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">{categoryLabel}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={2} />
                  {Number(food.rating || 4).toFixed(1)}
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                {food.description || 'No description available for this item.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Price
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatPrice(food.price)}</p>

              <div className="mt-6">
                {quantity > 0 ? (
                  <div className="inline-flex h-12 min-h-[48px] items-center rounded-2xl bg-brand-50 p-1 ring-1 ring-brand-100">
                    <button
                      type="button"
                      onClick={handleRemoveFromCart}
                      className="inline-flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-brand-700 transition-colors duration-200 hover:bg-brand-100"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.4} />
                    </button>

                    <span className="w-10 text-center text-sm font-bold text-brand-700">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isUnavailable}
                      className={`inline-flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-brand-500 text-white transition-colors duration-200 hover:bg-brand-600 ${
                        isUnavailable ? 'cursor-not-allowed opacity-60 hover:bg-brand-500' : ''
                      }`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isUnavailable}
                    className={`inline-flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition-all duration-200 ${
                      isUnavailable
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98]'
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                    {isUnavailable ? 'Unavailable' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Availability
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {isUnavailable ? 'Out of stock' : 'Available to order'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Availability updates live from the kitchen dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav cartCount={cartCount} />
    </div>
  );
};

export default FoodDetails;

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Filter,
  Plus,
  RefreshCcw,
  Search,
  Tag,
  UtensilsCrossed,
  XCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import FoodFormModal from '../components/FoodFormModal';
import FoodTable from '../components/FoodTable';
import StatsCard from '../components/StatsCard';
import { foodService } from '../services/foods';
import { useKitchenStore } from '../store/useKitchenStore';

const Dashboard = ({
  showStats = true,
  title = 'Kitchen dashboard',
  subtitle = 'Track availability, pricing, and performance from one screen.'
}) => {
  const foods = useKitchenStore((state) => state.foods);
  const categories = useKitchenStore((state) => state.categories);
  const stats = useKitchenStore((state) => state.stats);
  const isLoading = useKitchenStore((state) => state.isLoading);
  const error = useKitchenStore((state) => state.error);
  const fetchKitchenData = useKitchenStore((state) => state.fetchKitchenData);
  const upsertFood = useKitchenStore((state) => state.upsertFood);
  const removeFood = useKitchenStore((state) => state.removeFood);
  const updateFoodAvailability = useKitchenStore((state) => state.updateFoodAvailability);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());

  useEffect(() => {
    fetchKitchenData();
  }, [fetchKitchenData]);

  const filteredFoods = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return foods.filter((food) => {
      const categoryLabel =
        typeof food.category === 'object'
          ? food.category?.name || ''
          : food.category || '';

      if (categoryFilter !== 'all' && categoryLabel !== categoryFilter) {
        return false;
      }

      if (typeFilter !== 'all' && food.type !== typeFilter) {
        return false;
      }

      if (availabilityFilter === 'available' && food.isAvailable === false) {
        return false;
      }

      if (availabilityFilter === 'unavailable' && food.isAvailable !== false) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${food.name} ${food.description || ''} ${food.category || ''}`
        .toLowerCase()
        .trim();

      return (
        haystack.includes(normalizedSearch) ||
        categoryLabel.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [foods, searchQuery, categoryFilter, typeFilter, availabilityFilter]);

  const categoryOptions = useMemo(
    () => categories.filter((category) => category?.name),
    [categories]
  );

  const openCreateModal = () => {
    setEditingFood(null);
    setIsModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFood(null);
  };

  const handleSubmitFood = async (payload) => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = editingFood
        ? await foodService.updateFood(editingFood.id, payload)
        : await foodService.createFood(payload);

      const food = response?.data;
      if (food) {
        upsertFood(food);
      }

      setStatus({ type: 'success', message: 'Food item saved successfully.' });
      closeModal();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Unable to save the food item.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFood = async (food) => {
    if (!food?.id) {
      return;
    }

    const confirmDelete = window.confirm(`Delete ${food.name}? This cannot be undone.`);
    if (!confirmDelete) {
      return;
    }

    setStatus(null);

    try {
      await foodService.deleteFood(food.id);
      removeFood(food.id);
      setStatus({ type: 'success', message: 'Food item deleted.' });
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Unable to delete the food.' });
    }
  };

  const handleToggleAvailability = async (food) => {
    if (!food?.id) {
      return;
    }

    setPendingIds((prev) => new Set([...prev, food.id]));
    setStatus(null);

    try {
      const nextAvailability = food.isAvailable === false;
      await foodService.updateAvailability(food.id, nextAvailability);
      updateFoodAvailability(food.id, nextAvailability);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Unable to update availability.'
      });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(food.id);
        return next;
      });
    }
  };

  return (
    <AdminLayout
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-200/50 transition-colors duration-200 hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add food
          </button>
          <button
            type="button"
            onClick={fetchKitchenData}
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-brand-200 hover:text-brand-600"
          >
            <RefreshCcw className="h-4 w-4" strokeWidth={2.2} />
            Refresh
          </button>
        </>
      }
    >
      {showStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total foods"
            value={stats.totalFoods}
            icon={UtensilsCrossed}
            tone="brand"
            footer="Across all categories"
          />
          <StatsCard
            title="Total categories"
            value={stats.totalCategories}
            icon={Tag}
            tone="slate"
            footer="Active and inactive"
          />
          <StatsCard
            title="Available"
            value={stats.availableFoods}
            icon={CheckCircle2}
            tone="emerald"
            footer="Ready to order"
          />
          <StatsCard
            title="Out of stock"
            value={stats.outOfStockFoods}
            icon={XCircle}
            tone="rose"
            footer="Unavailable items"
          />
        </div>
      ) : null}

      <section className="mt-6 space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-card backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Food management</h2>
            <p className="text-sm text-slate-500">
              Search, filter, and update your menu in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
            <Filter className="h-4 w-4" strokeWidth={2.2} />
            {filteredFoods.length} items
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(3,0.8fr)]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search foods, categories, keywords"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm"
            />
          </label>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All types</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Out of stock</option>
          </select>
        </div>

        {status ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {status.message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Loading kitchen data...
          </div>
        ) : (
          <FoodTable
            items={filteredFoods}
            onEdit={openEditModal}
            onDelete={handleDeleteFood}
            onToggleAvailability={handleToggleAvailability}
            pendingIds={pendingIds}
          />
        )}
      </section>

      <FoodFormModal
        open={isModalOpen}
        mode={editingFood ? 'edit' : 'create'}
        initialValue={editingFood}
        categories={categories}
        isLoadingCategories={isLoading}
        onSubmit={handleSubmitFood}
        onClose={closeModal}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
};

export default Dashboard;

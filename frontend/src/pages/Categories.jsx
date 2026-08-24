import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCcw, Search, Tag } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import CategoryCard from '../components/CategoryCard';
import CategoryFormModal from '../components/CategoryFormModal';
import { categoryService } from '../services/categories';
import { useKitchenStore } from '../store/useKitchenStore';

const Categories = () => {
  const categories = useKitchenStore((state) => state.categories);
  const isLoading = useKitchenStore((state) => state.isLoading);
  const error = useKitchenStore((state) => state.error);
  const fetchKitchenData = useKitchenStore((state) => state.fetchKitchenData);
  const upsertCategory = useKitchenStore((state) => state.upsertCategory);
  const removeCategory = useKitchenStore((state) => state.removeCategory);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchKitchenData();
  }, [fetchKitchenData]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      if (statusFilter === 'active' && category.isActive === false) {
        return false;
      }

      if (statusFilter === 'inactive' && category.isActive !== false) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return String(category.name || '')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [categories, searchQuery, statusFilter]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (payload) => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = editingCategory
        ? await categoryService.updateCategory(editingCategory.id, payload)
        : await categoryService.createCategory(payload);

      const category = response?.data;
      if (category) {
        upsertCategory(category);
      }

      setStatus({ type: 'success', message: 'Category saved successfully.' });
      closeModal();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Unable to save the category.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category?.id) {
      return;
    }

    const confirmDelete = window.confirm(`Delete ${category.name}? This cannot be undone.`);
    if (!confirmDelete) {
      return;
    }

    setStatus(null);

    try {
      await categoryService.deleteCategory(category.id);
      removeCategory(category.id);
      setStatus({ type: 'success', message: 'Category deleted.' });
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Unable to delete category.' });
    }
  };

  const handleToggleActive = async (category) => {
    if (!category?.id) {
      return;
    }

    setPendingIds((prev) => new Set([...prev, category.id]));
    setStatus(null);

    try {
      const response = await categoryService.updateCategory(category.id, {
        isActive: category.isActive === false
      });
      const updatedCategory = response?.data;
      if (updatedCategory) {
        upsertCategory(updatedCategory);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Unable to update category.'
      });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(category.id);
        return next;
      });
    }
  };

  return (
    <AdminLayout
      title="Category management"
      subtitle="Keep your menu grouped and organized for every shift."
      actions={
        <>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-200/50 transition-colors duration-200 hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add category
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
      <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-card backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Category library</h2>
            <p className="text-sm text-slate-500">
              Control which categories show up on the customer menu.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
            <Tag className="h-4 w-4" strokeWidth={2.2} />
            {filteredCategories.length} categories
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.6fr_0.6fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
            Loading categories...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={openEditModal}
                onDelete={handleDeleteCategory}
                onToggleActive={handleToggleActive}
                pending={pendingIds.has(category.id)}
              />
            ))}
          </div>
        )}
      </section>

      <CategoryFormModal
        open={isModalOpen}
        mode={editingCategory ? 'edit' : 'create'}
        initialValue={editingCategory}
        onSubmit={handleSubmitCategory}
        onClose={closeModal}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
};

export default Categories;

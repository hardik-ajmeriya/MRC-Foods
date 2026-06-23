import { memo, useMemo } from 'react';
import {
  Flame,
  Leaf,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react';
import { resolveFoodImage } from '../utils/resolveImage';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);

const FoodTable = ({
  items = [],
  onEdit,
  onDelete,
  onToggleAvailability,
  pendingIds = new Set()
}) => {
  const pendingSet = useMemo(() => new Set(pendingIds || []), [pendingIds]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No food items match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Item</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Availability</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isPending = pendingSet.has(item.id);
              const isAvailable = item.isAvailable !== false;
              const categoryLabel =
                typeof item.category === 'object'
                  ? item.category?.name || 'Unassigned'
                  : item.category || 'Unassigned';
              const imageSrc = resolveFoodImage({
                image: item.image,
                categoryName: categoryLabel,
                categoryId: categoryLabel
              });

              return (
                <tr key={item.id} className="align-middle">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-14 overflow-hidden rounded-xl bg-slate-100">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.description || 'No description added'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {categoryLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.type === 'veg'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {item.type === 'veg' ? (
                        <Leaf className="h-3.5 w-3.5" strokeWidth={2.1} />
                      ) : (
                        <Flame className="h-3.5 w-3.5" strokeWidth={2.1} />
                      )}
                      {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability?.(item)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      } ${isPending ? 'opacity-60' : ''}`}
                    >
                      {isAvailable ? (
                        <ToggleRight className="h-4 w-4" strokeWidth={2.1} />
                      ) : (
                        <ToggleLeft className="h-4 w-4" strokeWidth={2.1} />
                      )}
                      {isAvailable ? 'Available' : 'Out of stock'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors duration-200 hover:border-brand-200 hover:text-brand-600"
                        aria-label="Edit food"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition-colors duration-200 hover:bg-rose-50"
                        aria-label="Delete food"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {items.map((item) => {
          const isPending = pendingSet.has(item.id);
          const isAvailable = item.isAvailable !== false;
          const categoryLabel =
            typeof item.category === 'object'
              ? item.category?.name || 'Unassigned'
              : item.category || 'Unassigned';
          const imageSrc = resolveFoodImage({
            image: item.image,
            categoryName: categoryLabel,
            categoryId: categoryLabel
          });

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-16 w-20 overflow-hidden rounded-2xl bg-slate-100">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.description || 'No description added'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      {categoryLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
                        item.type === 'veg'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {item.type === 'veg' ? (
                        <Leaf className="h-3.5 w-3.5" strokeWidth={2.1} />
                      ) : (
                        <Flame className="h-3.5 w-3.5" strokeWidth={2.1} />
                      )}
                      {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  {formatPrice(item.price)}
                </p>
                <button
                  type="button"
                  onClick={() => onToggleAvailability?.(item)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  } ${isPending ? 'opacity-60' : ''}`}
                >
                  {isAvailable ? (
                    <ToggleRight className="h-4 w-4" strokeWidth={2.1} />
                  ) : (
                    <ToggleLeft className="h-4 w-4" strokeWidth={2.1} />
                  )}
                  {isAvailable ? 'Available' : 'Out of stock'}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit?.(item)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(item)}
                  className="flex-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(FoodTable);

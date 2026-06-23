import { memo } from 'react';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { resolveFoodImage } from '../utils/resolveImage';

const CategoryCard = ({ category, onEdit, onDelete, onToggleActive, pending }) => {
  const imageSrc = resolveFoodImage({
    image: category.image,
    categoryName: category.name,
    categoryId: category.id
  });

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
      <div className="aspect-[4/3] bg-slate-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4">
        <div>
          <p className="text-sm font-semibold text-white">{category.name}</p>
          <p className="text-xs text-white/80">
            {category.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleActive?.(category)}
          disabled={pending}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors duration-200 ${
            category.isActive ? 'bg-emerald-500/80' : 'bg-slate-900/70'
          } ${pending ? 'opacity-60' : ''}`}
          aria-label="Toggle category"
        >
          <Power className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(category)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-colors duration-200 hover:bg-white"
          aria-label="Edit category"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(category)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm transition-colors duration-200 hover:bg-white"
          aria-label="Delete category"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default memo(CategoryCard);

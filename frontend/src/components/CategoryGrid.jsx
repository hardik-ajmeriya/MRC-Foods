import { memo } from 'react';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import { resolveFoodImage } from '../utils/resolveImage';

const CategoryGrid = ({ categories, onSelect }) => {
  return (
    <section aria-label="Food categories" className="pb-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const imageSrc = resolveFoodImage({
            image: category.image,
            categoryName: category.name,
            categoryId: category.id
          });

          return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category)}
            className="group relative overflow-hidden rounded-2xl bg-slate-100 shadow-card ring-1 ring-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
          >
            <div className="aspect-[4/3]">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                  <ImageIcon className="h-8 w-8" strokeWidth={1.8} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3 pt-6">
              <span className="text-sm font-semibold text-white sm:text-base">
                {category.name}
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30">
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </span>
            </div>
          </button>
          );
        })}
      </div>
    </section>
  );
};

export default memo(CategoryGrid);

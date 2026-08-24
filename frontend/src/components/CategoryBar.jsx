import { memo } from 'react';
import { Grid2X2, UtensilsCrossed } from 'lucide-react';

const isImageSource = (value) =>
  typeof value === 'string' && /^(https?:\/\/|\/|data:image)/i.test(value);

const CategoryBar = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="mb-5">
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-300/40'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {category.id === 'all' ? (
                    <Grid2X2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                  ) : isImageSource(category.icon) ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UtensilsCrossed className="h-3.5 w-3.5" strokeWidth={2.2} />
                  )}
                </span>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CategoryBar);

import { memo, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onDebouncedChange, disabled = false }) => {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedChange(internalValue.trimStart());
    }, 300);

    return () => clearTimeout(timer);
  }, [internalValue, onDebouncedChange]);

  return (
    <div className="mb-4">
      <label htmlFor="food-search" className="sr-only">
        Search for food
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          strokeWidth={2.2}
        />

        <input
          id="food-search"
          type="text"
          value={internalValue}
          disabled={disabled}
          onChange={(event) => setInternalValue(event.target.value)}
          placeholder="Search for food, dishes..."
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-11 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
        />

        {internalValue ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setInternalValue('')}
            className="absolute right-2 top-1/2 inline-flex h-9 w-9 min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default memo(SearchBar);

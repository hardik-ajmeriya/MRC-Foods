import { memo } from 'react';

const SkeletonLoader = () => {
  const categorySkeletons = Array.from({ length: 5 }, (_, index) => `category-${index}`);
  const cardSkeletons = Array.from({ length: 8 }, (_, index) => `card-${index}`);

  return (
    <div className="animate-pulse">
      <div className="no-scrollbar -mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {categorySkeletons.map((key) => (
          <div key={key} className="h-11 w-28 shrink-0 rounded-full bg-slate-200" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cardSkeletons.map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
            <div className="mb-3 aspect-[4/3] rounded-xl bg-slate-200" />
            <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mb-1 h-3 w-full rounded bg-slate-100" />
            <div className="mb-3 h-3 w-2/3 rounded bg-slate-100" />
            <div className="mb-3 h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-11 rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(SkeletonLoader);

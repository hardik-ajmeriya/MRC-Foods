import { memo } from 'react';
import { AlertTriangle, RefreshCw, UtensilsCrossed } from 'lucide-react';

const EmptyState = ({
  variant = 'empty',
  title = 'No items available',
  subtitle = 'Items will appear here when available',
  onRefresh,
  actionLabel = 'Refresh'
}) => {
  const isError = variant === 'error';
  const Icon = isError ? AlertTriangle : UtensilsCrossed;

  return (
    <section className="flex min-h-[320px] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
            isError ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <Icon className="h-8 w-8" strokeWidth={2} />
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>

        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="mt-6 inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2.2} />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default memo(EmptyState);

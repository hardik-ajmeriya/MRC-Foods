import { memo, useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Star, UtensilsCrossed } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FALLBACK_IMAGE = '/fallback.png';

const resolveApiOrigin = () => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return 'http://localhost:5000';
  }
};

const apiOrigin = resolveApiOrigin();

const resolveImageSrc = (value) => {
  if (!value) {
    return '';
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return '';
  }

  if (/^(https?:\/\/|data:image\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    return `${apiOrigin}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${apiOrigin}/${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${apiOrigin}/uploads/${encodeURIComponent(trimmed)}`;
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);

const FoodCard = ({ item, quantity, onAddToCart, onRemoveFromCart, onViewDetails }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => resolveImageSrc(item.image));

  useEffect(() => {
    setImageFailed(false);
    setImageSrc(resolveImageSrc(item.image));
  }, [item.image]);

  const handleImageError = () => {
    if (!imageSrc || imageSrc === FALLBACK_IMAGE) {
      setImageFailed(true);
      return;
    }

    setImageSrc(FALLBACK_IMAGE);
  };

  const hasImage = useMemo(
    () => Boolean(imageSrc) && !imageFailed,
    [imageSrc, imageFailed]
  );

  const isUnavailable = item.isAvailable === false;

  return (
    <article className="group overflow-hidden rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]">
      <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-100">
        <button
          type="button"
          onClick={() => onViewDetails?.(item)}
          className="block w-full text-left"
          aria-label={`View ${item.name} details`}
        >
          <div className="aspect-[4/3]">
            {hasImage ? (
              <img
                src={imageSrc}
                alt={item.name}
                loading="lazy"
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                <UtensilsCrossed className="h-8 w-8" strokeWidth={1.8} />
              </div>
            )}
          </div>
        </button>

        {isUnavailable ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-slate-900/70 px-2 py-1.5 text-[11px] font-semibold text-white">
            Currently unavailable
          </div>
        ) : null}

        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {item.isVeg ? 'Veg' : 'Non-Veg'}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">
          <button
            type="button"
            onClick={() => onViewDetails?.(item)}
            className="text-left"
          >
            {item.name}
          </button>
        </h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500 sm:text-sm">
          {item.description}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900 sm:text-base">{formatPrice(item.price)}</p>

        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={2} />
          {item.rating.toFixed(1)}
        </div>
      </div>

      <div className="mt-3">
        {quantity > 0 ? (
          <div className="inline-flex h-11 min-h-[44px] items-center rounded-xl bg-brand-50 p-1 ring-1 ring-brand-100">
            <button
              type="button"
              onClick={() => onRemoveFromCart(item.id)}
              aria-label={`Remove one ${item.name}`}
              className="inline-flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-brand-700 transition-colors duration-200 hover:bg-brand-100"
            >
              <Minus className="h-4 w-4" strokeWidth={2.4} />
            </button>

            <span className="w-8 text-center text-sm font-bold text-brand-700">{quantity}</span>

            <button
              type="button"
              onClick={() => onAddToCart(item.id)}
              disabled={isUnavailable}
              aria-label={`Add one ${item.name}`}
              className={`inline-flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg bg-brand-500 text-white transition-colors duration-200 hover:bg-brand-600 ${
                isUnavailable ? 'cursor-not-allowed opacity-60 hover:bg-brand-500' : ''
              }`}
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(item.id)}
            disabled={isUnavailable}
            className={`inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all duration-200 ${
              isUnavailable
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98]'
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            {isUnavailable ? 'Unavailable' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  );
};

export default memo(FoodCard);

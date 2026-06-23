const toneStyles = {
  brand: {
    ring: 'ring-brand-100',
    bg: 'bg-brand-50 text-brand-600',
    icon: 'text-brand-600'
  },
  emerald: {
    ring: 'ring-emerald-100',
    bg: 'bg-emerald-50 text-emerald-600',
    icon: 'text-emerald-600'
  },
  rose: {
    ring: 'ring-rose-100',
    bg: 'bg-rose-50 text-rose-600',
    icon: 'text-rose-600'
  },
  slate: {
    ring: 'ring-slate-200',
    bg: 'bg-slate-100 text-slate-600',
    icon: 'text-slate-600'
  }
};

const StatsCard = ({ title, value, icon: Icon, tone = 'brand', footer }) => {
  const toneConfig = toneStyles[tone] || toneStyles.brand;

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneConfig.bg} ring-1 ${toneConfig.ring}`}
        >
          {Icon ? <Icon className={`h-6 w-6 ${toneConfig.icon}`} strokeWidth={2.1} /> : null}
        </div>
      </div>
      {footer ? <p className="mt-3 text-xs text-slate-500">{footer}</p> : null}
    </div>
  );
};

export default StatsCard;

import { memo } from 'react';
import { House, MapPinned, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    Icon: House
  },
  {
    key: 'cart',
    label: 'Cart',
    path: '/cart',
    Icon: ShoppingCart
  },
  {
    key: 'track',
    label: 'Track',
    path: '/order-status',
    Icon: MapPinned
  }
];

const BottomNav = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {tabs.map(({ key, label, path, Icon }) => {
          const isHomeRoute =
            path === '/' &&
            (pathname === '/' || pathname.startsWith('/category') || pathname.startsWith('/food'));
          const isActive =
            isHomeRoute || (path !== '/' && pathname.startsWith(path));

          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(path)}
              className={`relative inline-flex min-h-[44px] flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2.1} />
              <span className="mt-1">{label}</span>

              {key === 'cart' && cartCount > 0 ? (
                <span className="absolute right-4 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default memo(BottomNav);

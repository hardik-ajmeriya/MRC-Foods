import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LayoutGrid,
  LogOut,
  Shield,
  Tag,
  UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

const navItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    Icon: LayoutGrid
  },
  {
    key: 'foods',
    label: 'Foods',
    path: '/staff/foods',
    Icon: UtensilsCrossed
  },
  {
    key: 'categories',
    label: 'Categories',
    path: '/staff/categories',
    Icon: Tag
  },
  {
    key: 'orders',
    label: 'Orders',
    path: '/staff/orders',
    Icon: ClipboardList
  }
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const roleLabel = useMemo(() => {
    if (user?.role === 'admin') {
      return 'Admin';
    }

    if (user?.role === 'staff') {
      return 'Staff';
    }

    return 'User';
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-full lg:w-64">
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-4 shadow-card backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-200/40">
            MF
          </div>
          <div>
            <p className="font-display text-base font-bold text-slate-900">MRC Foods</p>
            <p className="text-xs font-medium text-slate-500">Kitchen Suite</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm"
        >
          Customer
        </button>
      </div>

      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto lg:hidden">
        {navItems.map(({ key, label, path, Icon }) => {
          const isActive = pathname === path || pathname.startsWith(`${path}/`);

          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(path)}
              className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-200/50'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {label}
            </button>
          );
        })}
      </nav>

      <aside className="sticky top-6 hidden flex-col gap-6 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-card backdrop-blur lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-200/40">
            MF
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-900">MRC Foods</p>
            <p className="text-xs font-medium text-slate-500">Kitchen Suite</p>
          </div>
        </div>

        <div className="space-y-2">
          {navItems.map(({ key, label, path, Icon }) => {
            const isActive = pathname === path || pathname.startsWith(`${path}/`);

            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(path)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-200/40'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Shield className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'Kitchen User'}</p>
              <p className="text-xs text-slate-500">{roleLabel} access</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-rose-200 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.2} />
            Sign out
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
          >
            View customer app
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;

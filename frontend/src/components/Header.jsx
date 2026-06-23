import { memo } from 'react';
import { LayoutGrid, LogIn, LogOut, UserRound } from 'lucide-react';

const Header = ({
  user,
  isAuthenticated,
  onLogout,
  onLogin,
  onDashboard,
  showDashboard = false,
  dashboardIcon: DashboardIcon
}) => {
  const roleLabel =
    user?.role === 'staff' || user?.role === 'admin'
      ? 'Staff'
      : 'User';

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 font-display text-sm font-bold tracking-wide text-white shadow-lg shadow-brand-200/50">
            MF
          </div>

          <div>
            <p className="font-display text-lg font-bold tracking-tight text-slate-900">
              MRC Foods
            </p>
            <p className="text-xs font-medium text-slate-500">College Canteen</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showDashboard ? (
            <button
              type="button"
              onClick={onDashboard}
              aria-label="Open kitchen dashboard"
              className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl bg-brand-500 px-3 text-xs font-semibold text-white shadow-lg shadow-brand-200/40 transition-all duration-200 hover:bg-brand-600 active:scale-95"
            >
              {(DashboardIcon || LayoutGrid) && (
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  {DashboardIcon ? (
                    <DashboardIcon className="h-4 w-4" strokeWidth={2.4} />
                  ) : (
                    <LayoutGrid className="h-4 w-4" strokeWidth={2.4} />
                  )}
                </span>
              )}
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          ) : null}

          <span className="inline-flex h-8 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            {roleLabel}
          </span>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">
            {isAuthenticated ? (
              <span className="font-semibold text-slate-700">{userInitial}</span>
            ) : (
              <UserRound className="h-5 w-5" strokeWidth={2} />
            )}
          </div>

          <button
            type="button"
            onClick={isAuthenticated ? onLogout : onLogin}
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-brand-200 hover:text-brand-600 active:scale-95"
            aria-label={isAuthenticated ? 'Logout' : 'Login'}
          >
            {isAuthenticated ? (
              <LogOut className="h-5 w-5" strokeWidth={2} />
            ) : (
              <LogIn className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);

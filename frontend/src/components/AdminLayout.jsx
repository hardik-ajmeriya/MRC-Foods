import Sidebar from './Sidebar';

const AdminLayout = ({ title, subtitle, actions, children }) => {
  return (
    <div className="relative min-h-screen bg-surface text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(140%_120%_at_50%_0%,rgba(252,128,25,0.18),transparent_68%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <Sidebar />

        <div className="flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Kitchen suite
              </p>
              <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              ) : null}
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </header>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

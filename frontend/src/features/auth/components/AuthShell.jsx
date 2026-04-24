const AuthShell = ({ title, subtitle, children, footer }) => {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.12),transparent_35%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/75 p-8 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">MRC SaaS</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          {children}

          {footer ? <div className="mt-6 text-sm text-slate-400">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;

const toastVariants = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  error: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
};

const Toast = ({ type = 'info', message, onClose }) => {
  return (
    <div className="fixed right-4 top-4 z-50">
      <div
        className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          toastVariants[type] || toastVariants.info
        }`}
      >
        <div className="flex items-start gap-4">
          <p className="text-sm font-medium">{message}</p>
          <button
            type="button"
            className="text-xs text-slate-300 transition-colors hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

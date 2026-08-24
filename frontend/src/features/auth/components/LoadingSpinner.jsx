const LoadingSpinner = ({ label = 'Loading...', fullScreen = false }) => {
  const wrapperClass = fullScreen
    ? 'min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center'
    : 'flex items-center justify-center py-4';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

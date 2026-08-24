import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, user, getRoleHome } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const redirectTarget = useMemo(() => {
    if (location.state?.fromPath) {
      return location.state.fromPath;
    }

    return getRoleHome(user?.role);
  }, [location.state, getRoleHome, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectTarget]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toast]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      const message = 'Password must be at least 6 characters.';
      setError(message);
      setToast({ type: 'error', message });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (response?.success) {
        setToast({
          type: 'success',
          message: 'Registration successful. Redirecting...'
        });

        const roleRedirect = getRoleHome(response.user?.role);
        navigate(location.state?.fromPath || roleRedirect, { replace: true });
      }
    } catch (err) {
      const message = err?.message || 'Unable to register. Please try again.';
      setError(message);
      setToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast ? (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      ) : null}

      <AuthShell
        title="Create Account"
        subtitle="Set up your workspace access in a secure SaaS flow."
        footer={
          <>
            Already have an account?{' '}
            <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">
              Sign in
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoComplete="name"
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors duration-200 focus:border-cyan-400"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </AuthShell>
    </>
  );
};

export default RegisterPage;

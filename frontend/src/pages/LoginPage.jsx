import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    // Dynamically update form state based on control name attribute
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    // Populate either admin or employee dummy accounts for fast testing
    if (role === 'admin') {
      setForm({ email: 'admin@penthara.dev', password: 'admin123' });
    } else {
      setForm({ email: 'employee@penthara.dev', password: 'employee123' });
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-bgApp px-4 font-body overflow-hidden select-none">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-lg font-bold tracking-wider text-slate-900 uppercase text-center">
          Leave Management
        </h1>

        <div className="border border-slate-100 bg-white p-6 shadow-xs rounded">
          <div className="space-y-1 text-center mb-4">
            <h2 className="font-display text-md font-bold text-slate-900">
              Sign in to your account
            </h2>
            <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-3xs font-bold uppercase tracking-wider text-slate-550">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-100 rounded px-3 py-2 pl-9 text-xs text-slate-900 bg-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary-light"
                  placeholder="you@company.com"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-3xs font-bold uppercase tracking-wider text-slate-550">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-slate-100 rounded px-3 py-2 pl-9 pr-9 text-xs text-slate-900 bg-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary-light"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-light border border-danger/10 p-2.5 text-3xs font-bold text-danger leading-snug">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors rounded"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="border-t border-slate-100 mt-5 pt-4">
            <h4 className="mb-2.5 text-center text-3xs font-bold uppercase tracking-wider text-slate-400">
              Demo accounts
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo('employee')}
                className="flex flex-col justify-center border border-slate-100 bg-slate-50 p-2.5 text-left transition-all duration-200 hover:border-primary hover:bg-primary-light rounded"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-3xs leading-none mb-1">Employee</p>
                  <p className="text-4xs text-slate-400 truncate font-semibold">employee@penthara.dev</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex flex-col justify-center border border-slate-100 bg-slate-50 p-2.5 text-left transition-all duration-200 hover:border-primary hover:bg-primary-light rounded"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-3xs leading-none mb-1">Admin</p>
                  <p className="text-4xs text-slate-400 truncate font-semibold">admin@penthara.dev</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

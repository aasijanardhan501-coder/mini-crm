import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp, Eye, EyeOff, Mail, Lock, User,
  Shield, ChevronRight, AlertCircle,
} from 'lucide-react';

// ─── Reusable Input Field ─────────────────────────────────────────────────────
const Field = ({ label, id, icon: Icon, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        id={id}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none
          ${error
            ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-400'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
          } ${className}`}
        {...props}
      />
    </div>
    {error && (
      <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {error}
      </span>
    )}
  </div>
);

// ─── Password Field with show/hide toggle ─────────────────────────────────────
const PasswordField = ({ label, id, error, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Lock className="w-4 h-4" />
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all outline-none
            ${error
              ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
            }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
};

// ─── Main Login / Signup Page ─────────────────────────────────────────────────
const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [isLogin,     setIsLogin]     = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [formErrors,  setFormErrors]  = useState({});

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'admin',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  // Show session-expired toast
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) showToast('Session expired. Please log in again.', 'warning');
  }, []);

  // Reset form when toggling mode
  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'admin' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!isLogin) {
      if (!form.name.trim())          errors.name = 'Full name is required';
      else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    }

    if (!form.email.trim())           errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address';

    if (!form.password)               errors.password = 'Password is required';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!isLogin && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = isLogin
      ? await login(form.email.trim(), form.password)
      : await register(form.name.trim(), form.email.trim(), form.password, form.role);
    setLoading(false);

    if (result.success) {
      showToast(result.message, 'success');
      navigate(from, { replace: true });
    } else {
      showToast(result.message, 'error');
    }
  };

  // ── Password strength indicator (signup only) ──────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6)  s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength      = getStrength(form.password);
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-brand-500'][strength];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Mini CRM</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manage Your Leads<br />
            <span className="text-brand-200">Smarter & Faster</span>
          </h1>
          <p className="text-brand-100 text-base leading-relaxed mb-10">
            A production-ready Client Lead Management System built on the MERN stack.
          </p>


        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-600 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">Mini CRM</span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">

            {/* Tab toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-8">
              {['Sign In', 'Sign Up'].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setIsLogin(i === 0); switchMode(); setIsLogin(i === 0); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    (i === 0) === isLogin
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {isLogin
                  ? 'Sign in to access your CRM dashboard'
                  : 'Set up your Mini CRM account in seconds'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Name — signup only */}
              {!isLogin && (
                <Field
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Sarah Jenkins"
                  icon={User}
                  value={form.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  autoComplete="name"
                />
              )}

              {/* Email */}
              <Field
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="admin@mycrm.com"
                icon={Mail}
                value={form.email}
                onChange={handleChange}
                error={formErrors.email}
                autoComplete="email"
              />

              {/* Password */}
              <PasswordField
                label="Password"
                id="password"
                name="password"
                placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
                value={form.password}
                onChange={handleChange}
                error={formErrors.password}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />

              {/* Password strength bar — signup only */}
              {!isLogin && form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Password strength: <span className="text-slate-600 dark:text-slate-300">{strengthLabel}</span>
                  </p>
                </div>
              )}

              {/* Confirm Password — signup only */}
              {!isLogin && (
                <PasswordField
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={formErrors.confirmPassword}
                  autoComplete="new-password"
                />
              )}

              {/* Role selector — signup only */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Account Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm transition-all outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="admin">Admin — Full access</option>
                    <option value="manager">Manager — Manage leads</option>
                    <option value="viewer">Viewer — Read only</option>
                  </select>
                </div>
              )}

              {/* Remember me — login only */}
              {isLogin && (
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                    Remember me
                  </label>
                  <span className="hover:text-brand-500 cursor-pointer transition-colors">
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-sm font-bold tracking-wide shadow-lg shadow-brand-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode link */}
            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-6">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default LoginPage;

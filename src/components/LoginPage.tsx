import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, Wallet, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { User } from '../models/User';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials with user model
      const user = new User();
      const isValid = user.login(username, password);

      if (isValid) {
        if (rememberMe) {
          localStorage.setItem('smartspend_session', JSON.stringify({ loggedIn: true, username: user.username }));
        } else {
          sessionStorage.setItem('smartspend_session', JSON.stringify({ loggedIn: true, username: user.username }));
        }
        showToast("Welcome back, Samarth! Let's manage your money smartly.", 'success', 'Login Successful');
        onLoginSuccess(user);
      } else {
        setErrorMessage('Invalid username or password. Please try again.');
        showToast('Invalid username or password. Please try again.', 'error', 'Authentication Failed');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername(User.DEFAULT_USERNAME);
    setPassword(User.DEFAULT_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 overflow-hidden">
      {/* Decorative background blurs & ambient light */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Illustration & College Context */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart Student Finance Hub</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                SmartSpend
              </h1>
            </div>
            <p className="text-lg text-slate-300 font-medium">
              Personal Finance &amp; Expense Tracker
            </p>
            <p className="text-sm text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Designed for college students to track allowances, canteens, stationery, and monthly budgets effortlessly.
            </p>
          </div>

          {/* High-fidelity Student Finance Illustration */}
          <div className="relative mx-auto lg:mx-0 max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-800/40 backdrop-blur-sm group">
            <img
              src="/src/assets/images/smartspend_login_hero_1791018667021.jpg"
              alt="Student budgeting and finance workspace"
              className="w-full h-56 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-4">
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Personal Ledger Tracker
                </p>
                <p className="text-sm text-white font-medium">
                  Dynamic zero-initial-balance real ledger tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Real-time calculations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> LocalStorage persistence
            </span>
          </div>
        </div>

        {/* Right Side: Centered Glassmorphism Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-slate-900/70 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            <div className="mb-6 text-center sm:text-left">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Student Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered credentials to access your dashboard.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (Samarth Kathar)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <span className="text-xs text-slate-400">Case-sensitive</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (Samarth07)"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick Demo Fill */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-300">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
                >
                  Autofill Credentials
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">Required Demo Credentials:</p>
                <div className="flex items-center justify-center gap-4 text-slate-400 font-mono">
                  <span>User: <strong className="text-white font-semibold">Samarth Kathar</strong></span>
                  <span>Pass: <strong className="text-white font-semibold">Samarth07</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

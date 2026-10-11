import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Save, 
  RotateCcw, 
  Sparkles,
  Camera,
  GraduationCap,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { FinanceManager } from '../models/FinanceManager';

interface ProfileViewProps {
  financeManager: FinanceManager;
  onProfileUpdated: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
  onClearLedger: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  financeManager,
  onProfileUpdated,
  showToast,
  onClearLedger,
}) => {
  const user = financeManager.currentUser;
  const currencySymbol = user.currencyPreference || '₹';

  // Dynamic calculations from user transactions
  const totalTxns = financeManager.totalTransactionsCount;
  const totalIncome = financeManager.calculateIncome();
  const totalExpenses = financeManager.calculateExpenses();
  const balance = financeManager.calculateBalance();

  const [name, setName] = useState(user.name);
  const [currencyPreference, setCurrencyPreference] = useState(user.currencyPreference);
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [college, setCollege] = useState(user.college);
  const [academicYear, setAcademicYear] = useState(user.academicYear);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Preset student avatars
  const avatarPresets = [
    '/src/assets/images/profile_samarth_avatar_1791019657015.jpg',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    user.updateProfile({
      name: name.trim(),
      currencyPreference,
      profilePic,
      college: college.trim(),
      academicYear: academicYear.trim(),
    });
    financeManager.saveToLocalStorage();
    showToast('Profile and preferences updated successfully.', 'success', 'Profile Saved');
    onProfileUpdated();
  };

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString('en-IN', {
      minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <img
            src={profilePic || '/src/assets/images/profile_samarth_avatar_1791019657015.jpg'}
            alt={name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              {name}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              {user.accountType}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>{academicYear} · {college}</span>
          </p>

          <p className="text-xs text-slate-400">
            Account Purpose: <strong className="text-slate-200">{user.purpose}</strong>
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Student Account
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Local Encapsulation
            </span>
          </div>
        </div>
      </div>

      {/* Dynamically Calculated Stats Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Account Financial Aggregates (Live Ledger Calculations)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Records</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1 block">
              {totalTxns}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Inflow</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1 block">
              {fmt(totalIncome)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Outflow</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-1 block">
              {fmt(totalExpenses)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Current Balance</span>
            <span className={`text-xl font-bold font-mono tabular-nums mt-1 block ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
              {fmt(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile & Preferences Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            User Settings &amp; Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalize your student identity, currency symbol, and profile picture.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Avatar
            </label>
            <div className="flex flex-wrap gap-2.5">
              {avatarPresets.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setProfilePic(url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    profilePic === url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar option ${i + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Currency Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Preference
              </label>
              <select
                value={currencyPreference}
                onChange={(e) => setCurrencyPreference(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="¥">¥ - Japanese Yen (JPY)</option>
              </select>
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College / Institution
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Academic Year & Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course &amp; Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
              Clear All Ledger Transactions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently reset your transaction ledger to ₹0 balance (useful for demo presentations).
            </p>
          </div>

          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
            >
              Reset to ₹0
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearLedger();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

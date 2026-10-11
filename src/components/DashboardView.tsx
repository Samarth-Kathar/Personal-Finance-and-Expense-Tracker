import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PiggyBank, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { FinanceManager } from '../models/FinanceManager';
import { ActiveTab } from './TopNavbar';

interface DashboardViewProps {
  financeManager: FinanceManager;
  onOpenAddModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onEditTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  financeManager,
  onOpenAddModal,
  setActiveTab,
  onEditTransaction,
}) => {
  const currencySymbol = financeManager.currentUser.currencyPreference || '₹';

  // Dynamic calculations from finance manager
  const totalBalance = financeManager.calculateBalance();
  const totalIncome = financeManager.calculateIncome();
  const totalExpenses = financeManager.calculateExpenses();
  const monthSpending = financeManager.getCurrentMonthSpending();
  const savings = financeManager.calculateSavings();
  const transactions = financeManager.transactions;
  const recentTransactions = transactions.slice(0, 5);

  // Budget alerts
  const budgetAlerts = financeManager.budgetManager.checkAlerts(transactions);

  // Dynamic insights
  const insights = financeManager.generateInsights();
  const topInsight = insights.length > 0 ? insights[0] : null;

  // Format helper
  const fmt = (val: number) => {
    return `${currencySymbol}${val.toLocaleString('en-IN', {
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const isEmpty = transactions.length === 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Student Finance Manager
            </span>
            <span className="text-xs text-slate-400">
              Welcome, {financeManager.currentUser.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Smart Financial Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isEmpty
              ? 'Your account is ready. Add your first transaction to calculate real balances.'
              : `Tracking ${transactions.length} personal record${transactions.length > 1 ? 's' : ''} in your personal ledger.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-400/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Active Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alert, idx) => {
            const isExceeded = alert.type === 'exceeded';
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  isExceeded
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isExceeded ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <p className="text-xs font-medium">{alert.message}</p>
                </div>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-xs font-semibold underline hover:opacity-80 transition-opacity ml-3 shrink-0 cursor-pointer"
                >
                  Manage Budgets
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5 Dynamic Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Balance</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {fmt(totalBalance)}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Income - Expenses
            </p>
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {fmt(totalIncome)}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              From all credit records
            </p>
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {fmt(totalExpenses)}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              From all debit records
            </p>
          </div>
        </div>

        {/* 4. Current Month Spending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Month Spending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {fmt(monthSpending)}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Current calendar month
            </p>
          </div>
        </div>

        {/* 5. Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-teal-300 dark:hover:border-teal-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Savings</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${savings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {fmt(savings)}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {savings >= 0 ? 'Positive balance' : 'In deficit'}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State Banner (If no transactions exist) */}
      {isEmpty ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto shadow-sm space-y-5">
          <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
            <img
              src="/src/assets/images/smartspend_empty_vault_1791018684367.jpg"
              alt="Empty finance wallet"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Start your financial journey by adding your first transaction.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              SmartSpend starts with a strictly clean slate (₹0 Balance). No fake or random data is pre-populated. Add your college allowance, fees, or daily expenses below.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Your First Transaction</span>
          </button>
        </div>
      ) : (
        /* Populated Dashboard Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Transactions List (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({transactions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.map((txn) => {
                const isIncome = txn.type === 'income';
                return (
                  <div
                    key={txn.id}
                    onClick={() => onEditTransaction(txn.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/80 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {txn.category}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {txn.source} · {txn.date} · {txn.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p
                        className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {txn.getFormattedAmount(currencySymbol)}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                        {txn.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Insights & Action Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Top Insight Card */}
            {topInsight && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    Smart Insight
                  </h4>
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  {topInsight.title}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {topInsight.description}
                </p>
                <button
                  onClick={() => setActiveTab('insights')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore all insights</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Financial Health Summary Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Financial Health Summary
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Currently tracking <strong className="text-slate-800 dark:text-slate-200">{transactions.length} verified records</strong>. All income and expense flows are actively tracked and updated in real-time.
              </p>
              <button
                onClick={() => setActiveTab('budget')}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors text-center cursor-pointer"
              >
                View Category Budgets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

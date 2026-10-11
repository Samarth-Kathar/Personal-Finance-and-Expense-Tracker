import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { FinanceManager } from '../models/FinanceManager';

interface AnalyticsViewProps {
  financeManager: FinanceManager;
  onOpenAddModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  financeManager,
  onOpenAddModal,
}) => {
  const currencySymbol = financeManager.currentUser.currencyPreference || '₹';
  const transactions = financeManager.transactions;

  const totalIncome = financeManager.calculateIncome();
  const totalExpenses = financeManager.calculateExpenses();
  const netSavings = financeManager.calculateSavings();
  const currentMonthSpending = financeManager.getCurrentMonthSpending();

  // Category summary from finance manager
  const categorySummary = financeManager.getCategorySpendingSummary();
  // Monthly trend from finance manager
  const monthlyTrend = financeManager.getMonthlyTrend(6);

  // Check if enough data exists
  const hasEnoughData = transactions.length >= 1;

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString('en-IN', {
      minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;

  if (!hasEnoughData) {
    return (
      <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8 animate-in fade-in">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <BarChart3 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Add more transactions to see your financial analytics.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Charts and breakdowns are computed strictly from real entries. Record your daily allowance or student expenses to unlock analytics.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Transaction</span>
        </button>
      </div>
    );
  }

  // Color palette for category slices
  const categoryColors = [
    '#10B981', // emerald
    '#6366F1', // indigo
    '#F59E0B', // amber
    '#EC4899', // pink
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#14B8A6', // teal
    '#F97316', // orange
    '#64748B', // slate
  ];

  // Maximum value for scaling monthly trend chart
  const maxMonthlyVal = Math.max(
    ...monthlyTrend.map((m) => Math.max(m.income, m.expense)),
    100
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics &amp; Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Computed in real-time from {transactions.length} recorded transaction{transactions.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
            {totalIncome > 0 ? `${Math.round((netSavings / totalIncome) * 100)}% Savings Rate` : '0% Savings Rate'}
          </span>
        </div>
      </div>

      {/* Grid: Chart 1 (Income vs Expense) & Chart 2 (Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Income vs Expense Comparison */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-500" />
              <span>Income vs Expense Ratio</span>
            </h3>
            <span className="text-[11px] text-slate-400">All-Time</span>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {totalIncome + totalExpenses > 0 ? (
                <>
                  <div
                    style={{
                      width: `${(totalIncome / (totalIncome + totalExpenses)) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Income: ${fmt(totalIncome)}`}
                  />
                  <div
                    style={{
                      width: `${(totalExpenses / (totalIncome + totalExpenses)) * 100}%`,
                    }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Expense: ${fmt(totalExpenses)}`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-slate-300 dark:bg-slate-700" />
              )}
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Income ({totalIncome + totalExpenses > 0 ? Math.round((totalIncome / (totalIncome + totalExpenses)) * 100) : 0}%)
              </span>
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Expense ({totalIncome + totalExpenses > 0 ? Math.round((totalExpenses / (totalIncome + totalExpenses)) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Detailed summary boxes */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">Total Inflow</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
                {fmt(totalIncome)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
              <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">Total Outflow</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-0.5">
                {fmt(totalExpenses)}
              </p>
            </div>
          </div>

          {/* Net Margin */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Net Surplus / Savings</span>
            <span className={`font-bold font-mono tabular-nums ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {netSavings >= 0 ? '+' : ''}{fmt(netSavings)}
            </span>
          </div>
        </div>

        {/* 2. Expense by Category Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              <span>Expense by Category</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {categorySummary.length} Active Categories
            </span>
          </div>

          {categorySummary.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No expense records recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {categorySummary.slice(0, 6).map((item, idx) => {
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({item.count} entry{item.count > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          {fmt(item.amount)}
                        </span>
                        <span className="text-[11px] text-slate-400 w-8 text-right font-mono">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Chart 3 (Monthly Spending & Income Trend) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Monthly Spending &amp; Income Trend</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Historical cashflow across the last 6 calendar months
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Income</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Expense</span>
            </span>
          </div>
        </div>

        {/* SVG/HTML Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 dark:border-slate-800 px-2">
            {monthlyTrend.map((m) => {
              const incomeHeight = maxMonthlyVal > 0 ? (m.income / maxMonthlyVal) * 100 : 0;
              const expenseHeight = maxMonthlyVal > 0 ? (m.expense / maxMonthlyVal) * 100 : 0;

              return (
                <div key={m.month} className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="flex items-end gap-1 sm:gap-2 h-full w-full justify-center">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                      className="w-3 sm:w-6 bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:bg-emerald-400 relative"
                      title={`Income: ${fmt(m.income)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                      className="w-3 sm:w-6 bg-rose-500 rounded-t-md transition-all duration-500 group-hover:bg-rose-400 relative"
                      title={`Expense: ${fmt(m.expense)}`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 whitespace-nowrap">
                    {m.monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Metrics Summary Footnote */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Month Spending</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {fmt(currentMonthSpending)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monthly Income Inflow</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {fmt(financeManager.getCurrentMonthIncome())}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Savings Trend</span>
            <span className={`text-sm font-bold font-mono tabular-nums ${netSavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {netSavings >= 0 ? '+' : ''}{fmt(netSavings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

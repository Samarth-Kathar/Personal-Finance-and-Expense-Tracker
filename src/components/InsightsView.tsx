import React from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  PlusCircle, 
  ShieldAlert, 
  Award,
  Wallet,
  Calendar
} from 'lucide-react';
import { FinanceManager } from '../models/FinanceManager';

interface InsightsViewProps {
  financeManager: FinanceManager;
  onOpenAddModal: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  financeManager,
  onOpenAddModal,
}) => {
  const currencySymbol = financeManager.currentUser.currencyPreference || '₹';
  const transactions = financeManager.transactions;
  const insights = financeManager.generateInsights();

  const totalIncome = financeManager.calculateIncome();
  const totalExpenses = financeManager.calculateExpenses();
  const savings = financeManager.calculateSavings();
  const averageExpense = financeManager.getAverageExpense();

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString('en-IN', {
      minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;

  if (transactions.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8 animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
          <Lightbulb className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Smart Insights Require Real Data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SmartSpend generates mathematical intelligence purely from user-logged transactions. Add your first income or expense to generate dynamic spending analysis.
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <span>Smart Financial Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Algorithmic patterns and tips calculated strictly from your recorded transactions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
            {insights.length} Active Intelligence Card{insights.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          let cardBorder = 'border-slate-200 dark:border-slate-800';
          let icon = <Lightbulb className="w-5 h-5 text-amber-500" />;
          let iconBg = 'bg-amber-50 dark:bg-amber-950/60';

          if (insight.type === 'positive') {
            cardBorder = 'border-emerald-200 dark:border-emerald-900/60';
            icon = <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            iconBg = 'bg-emerald-50 dark:bg-emerald-950/60';
          } else if (insight.type === 'warning') {
            cardBorder = 'border-rose-200 dark:border-rose-900/60';
            icon = <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
            iconBg = 'bg-rose-50 dark:bg-rose-950/60';
          } else if (insight.type === 'highlight') {
            cardBorder = 'border-indigo-200 dark:border-indigo-900/60';
            icon = <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
            iconBg = 'bg-indigo-50 dark:bg-indigo-950/60';
          }

          return (
            <div
              key={insight.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${cardBorder} shadow-xs flex items-start gap-4 transition-all hover:shadow-md`}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Financial Health Scorecard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Student Financial Behavior Summary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Average Expense Outlay</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1 block">
              {fmt(averageExpense)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Per recorded transaction</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Inflow vs Outflow Ratio</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1 block">
              {totalExpenses > 0 ? (totalIncome / totalExpenses).toFixed(2) : 'N/A'}x
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {totalIncome >= totalExpenses ? 'Income covers all expenses' : 'Expenses exceed income'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Net Accumulated Savings</span>
            <span className={`text-lg font-bold font-mono tabular-nums mt-1 block ${savings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {savings >= 0 ? '+' : ''}{fmt(savings)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {savings >= 0 ? 'Safe reserve available' : 'Consider limiting leisure spending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  PiggyBank, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Target,
  IndianRupee
} from 'lucide-react';
import { FinanceManager } from '../models/FinanceManager';
import { BUDGET_DEFAULT_CATEGORIES } from '../constants/categories';

interface BudgetViewProps {
  financeManager: FinanceManager;
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  financeManager,
  onRefresh,
  showToast,
}) => {
  const currencySymbol = financeManager.currentUser.currencyPreference || '₹';
  const transactions = financeManager.transactions;
  const budgetManager = financeManager.budgetManager;

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get active budgets for the current month
  const activeBudgets = budgetManager.getAllBudgets(currentMonthKey);

  // Form states for creating/editing a budget
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(BUDGET_DEFAULT_CATEGORIES[0]);
  const [limitInput, setLimitInput] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) {
      showToast('Please enter a valid budget amount greater than 0.', 'error', 'Invalid Limit');
      return;
    }

    const cat = editingCategory || selectedCategory;
    budgetManager.setBudget(cat, limit, currentMonthKey);
    
    // Check if new budget immediately breaches threshold
    const budget = budgetManager.getBudget(cat, currentMonthKey);
    if (budget) {
      const status = budget.toStatusReport(transactions);
      if (status.status === 'exceeded') {
        showToast(`Budget limit reached for ${cat}! (Spent: ${currencySymbol}${status.spent.toLocaleString('en-IN')})`, 'error', 'Budget Exceeded');
      } else if (status.status === 'warning') {
        showToast(`Warning: You have used ${status.percentage}% of your ${cat} budget.`, 'warning', 'Budget Warning');
      } else {
        showToast(`Monthly budget for ${cat} set to ${currencySymbol}${limit.toLocaleString('en-IN')}.`, 'success', 'Budget Saved');
      }
    }

    setEditingCategory(null);
    setIsAddingNew(false);
    setLimitInput('');
    onRefresh();
  };

  const handleDeleteBudget = (cat: string) => {
    budgetManager.deleteBudget(cat, currentMonthKey);
    showToast(`Removed budget limit for ${cat}.`, 'info', 'Budget Removed');
    onRefresh();
  };

  const startEdit = (cat: string, currentLimit: number) => {
    setEditingCategory(cat);
    setLimitInput(currentLimit.toString());
    setIsAddingNew(false);
  };

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString('en-IN', {
      minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;

  // Find categories not yet configured
  const existingCategories = new Set(activeBudgets.map((b) => b.category.toLowerCase()));
  const unconfiguredCategories = BUDGET_DEFAULT_CATEGORIES.filter(
    (c) => !existingCategories.has(c.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Hero Card with Generated 3D Asset */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
            <Target className="w-3.5 h-3.5" />
            <span>Target Discipline &amp; Threshold Alerts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Monthly Expense Budgets ({currentMonthName})
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Set budget caps for canteens, stationery, travel, and campus activities. SmartSpend automatically tracks your progress and alerts you at 80% and 100% capacity.
          </p>
        </div>

        <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg hidden sm:block">
          <img
            src="/src/assets/images/smartspend_budget_card_1791018701802.jpg"
            alt="Student budget planner"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Targets
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeBudgets.length} configured category limit{activeBudgets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!isAddingNew && !editingCategory && unconfiguredCategories.length > 0 && (
          <button
            onClick={() => {
              setIsAddingNew(true);
              setSelectedCategory(unconfiguredCategories[0]);
              setLimitInput('1500');
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Set Category Budget</span>
          </button>
        )}
      </div>

      {/* Add or Edit Budget Inline Panel */}
      {(isAddingNew || editingCategory) && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingCategory ? `Edit Budget for ${editingCategory}` : 'Set New Category Budget'}
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingCategory(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              {editingCategory ? (
                <input
                  type="text"
                  disabled
                  value={editingCategory}
                  className="w-full py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500"
                />
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  {unconfiguredCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Limit ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingCategory(null);
                }}
                className="py-2 px-3 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      {activeBudgets.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            No Budgets Set for This Month
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Setting category budgets helps keep track of food, canteen, stationery, and travel spending with automatic threshold alerts.
          </p>
          <button
            onClick={() => {
              setIsAddingNew(true);
              setLimitInput('1500');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Your First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBudgets.map((budget) => {
            const report = budget.toStatusReport(transactions);
            const isExceeded = report.status === 'exceeded';
            const isWarning = report.status === 'warning';

            let progressColor = 'bg-emerald-500';
            let cardBorder = 'border-slate-200 dark:border-slate-800';

            if (isExceeded) {
              progressColor = 'bg-rose-500';
              cardBorder = 'border-rose-300 dark:border-rose-900/80';
            } else if (isWarning) {
              progressColor = 'bg-amber-500';
              cardBorder = 'border-amber-300 dark:border-amber-900/80';
            }

            return (
              <div
                key={budget.category}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${cardBorder} shadow-xs space-y-4 relative`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {budget.category}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {currentMonthName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(budget.category, budget.limit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit budget limit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.category)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      {report.percentage}% used
                    </span>
                    <span className="font-mono text-slate-500">
                      {fmt(report.spent)} / {fmt(report.limit)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(report.percentage, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    />
                  </div>
                </div>

                {/* Values row */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Spent</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      {fmt(report.spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining</span>
                    <span className={`font-bold font-mono tabular-nums ${report.remaining === 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {fmt(report.remaining)}
                    </span>
                  </div>
                </div>

                {/* Alerts / Status Banner */}
                {isExceeded ? (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Budget limit reached for this category.</span>
                  </div>
                ) : isWarning ? (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Warning: You have used 80% of your budget.</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Spending is well within budget limit.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

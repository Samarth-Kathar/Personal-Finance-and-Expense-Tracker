import { BudgetDTO, BudgetStatus } from '../types';
import { Transaction } from './Transaction';

/**
 * =====================================================================
 * SINGLE RESPONSIBILITY & DATA MODELING
 * The Budget class encapsulates monthly category spending limits and
 * calculates real consumption metrics against actual transactions.
 * =====================================================================
 */
export class Budget {
  public category: string;
  public limit: number;
  public month: string; // YYYY-MM

  constructor(category: string, limit: number, month?: string) {
    this.category = category.trim();
    this.limit = Math.max(0, Number(limit) || 0);
    this.month = month || new Date().toISOString().slice(0, 7);
  }

  /**
   * Calculates actual expense amount for this category in the specified month
   */
  public getSpent(transactions: Transaction[]): number {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const matchesCategory = t.category.toLowerCase() === this.category.toLowerCase();
        const matchesMonth = t.date.startsWith(this.month);
        return matchesCategory && matchesMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates remaining amount before hitting budget
   */
  public getRemaining(transactions: Transaction[]): number {
    const spent = this.getSpent(transactions);
    return Math.max(0, this.limit - spent);
  }

  /**
   * Calculates consumption percentage
   */
  public getPercentage(transactions: Transaction[]): number {
    if (this.limit <= 0) return 0;
    const spent = this.getSpent(transactions);
    return Math.min(200, Math.round((spent / this.limit) * 100));
  }

  /**
   * Evaluates warning and breach thresholds
   */
  public getStatus(transactions: Transaction[]): 'normal' | 'warning' | 'exceeded' {
    const pct = this.getPercentage(transactions);
    if (pct >= 100) return 'exceeded';
    if (pct >= 80) return 'warning';
    return 'normal';
  }

  /**
   * Returns a comprehensive status report object
   */
  public toStatusReport(transactions: Transaction[]): BudgetStatus {
    const spent = this.getSpent(transactions);
    const percentage = this.limit > 0 ? Math.round((spent / this.limit) * 100) : 0;
    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'warning';

    return {
      category: this.category,
      limit: this.limit,
      spent,
      remaining: Math.max(0, this.limit - spent),
      percentage,
      status,
    };
  }

  public toJSON(): BudgetDTO {
    return {
      category: this.category,
      limit: this.limit,
      month: this.month,
    };
  }

  public static fromJSON(data: BudgetDTO): Budget {
    return new Budget(data.category, data.limit, data.month);
  }
}

/**
 * =====================================================================
 * AGGREGATION & CONTROLLER
 * BudgetManager manages the entire collection of category budgets.
 * =====================================================================
 */
export class BudgetManager {
  private _budgets: Map<string, Budget> = new Map();
  private static readonly STORAGE_KEY = 'smartspend_budgets';

  // Standard student budget categories
  public static readonly DEFAULT_CATEGORIES = [
    'Food',
    'Canteen',
    'Transport',
    'Stationery',
    'Entertainment',
    'Shopping',
    'College Expenses',
    'Other',
  ];

  constructor() {
    this.loadFromLocalStorage();
  }

  public setBudget(category: string, limit: number, month?: string): Budget {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const key = `${category.toLowerCase()}_${currentMonth}`;
    const budget = new Budget(category, limit, currentMonth);
    this._budgets.set(key, budget);
    this.saveToLocalStorage();
    return budget;
  }

  public getBudget(category: string, month?: string): Budget | undefined {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const key = `${category.toLowerCase()}_${currentMonth}`;
    return this._budgets.get(key);
  }

  public deleteBudget(category: string, month?: string): boolean {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const key = `${category.toLowerCase()}_${currentMonth}`;
    const deleted = this._budgets.delete(key);
    if (deleted) this.saveToLocalStorage();
    return deleted;
  }

  public getAllBudgets(month?: string): Budget[] {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    return Array.from(this._budgets.values()).filter((b) => b.month === currentMonth);
  }

  /**
   * Generates active warnings for categories at >=80% or >=100%
   */
  public checkAlerts(transactions: Transaction[]): { category: string; type: 'warning' | 'exceeded'; message: string }[] {
    const alerts: { category: string; type: 'warning' | 'exceeded'; message: string }[] = [];
    const currentBudgets = this.getAllBudgets();

    for (const b of currentBudgets) {
      const status = b.toStatusReport(transactions);
      if (status.status === 'exceeded') {
        alerts.push({
          category: b.category,
          type: 'exceeded',
          message: `Budget limit reached for ${b.category}! (${status.percentage}% spent). Consider reducing spending.`,
        });
      } else if (status.status === 'warning') {
        alerts.push({
          category: b.category,
          type: 'warning',
          message: `Warning: You have used ${status.percentage}% of your ${b.category} budget.`,
        });
      }
    }
    return alerts;
  }

  public saveToLocalStorage(): void {
    try {
      const list = Array.from(this._budgets.values()).map((b) => b.toJSON());
      localStorage.setItem(BudgetManager.STORAGE_KEY, JSON.stringify(list));
    } catch {
      // LocalStorage error handling
    }
  }

  public loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(BudgetManager.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetDTO[];
        this._budgets.clear();
        for (const item of parsed) {
          const budget = Budget.fromJSON(item);
          const key = `${budget.category.toLowerCase()}_${budget.month}`;
          this._budgets.set(key, budget);
        }
      }
    } catch {
      this._budgets.clear();
    }
  }
}

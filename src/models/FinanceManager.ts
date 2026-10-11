import { FilterOptions, TransactionDTO } from '../types';
import { Transaction, IncomeTransaction, ExpenseTransaction } from './Transaction';
import { User } from './User';
import { BudgetManager } from './Budget';
import { InsightsEngine } from './InsightsEngine';

/**
 * =====================================================================
 * CONTROLLER / FACADE & SYSTEM ENCAPSULATION
 * FinanceManager serves as the central hub of business logic for SmartSpend.
 * It manages transactions, performs all mathematical aggregations dynamically
 * from user records, syncs to localStorage, and maintains user sessions.
 * =====================================================================
 */
export class FinanceManager {
  // Encapsulated state
  private _transactions: Transaction[] = [];
  private _currentUser: User;
  private _budgetManager: BudgetManager;

  // LocalStorage keys
  private static readonly TXN_STORAGE_KEY = 'smartspend_transactions';
  private static readonly USER_STORAGE_KEY = 'smartspend_user';

  constructor() {
    this._currentUser = new User();
    this._budgetManager = new BudgetManager();
    this.loadFromLocalStorage();
  }

  // Getters for controlled access
  get currentUser(): User {
    return this._currentUser;
  }

  get budgetManager(): BudgetManager {
    return this._budgetManager;
  }

  get transactions(): Transaction[] {
    // Return a shallow copy to prevent unauthorized direct mutations
    return [...this._transactions];
  }

  get totalTransactionsCount(): number {
    return this._transactions.length;
  }

  /**
   * ENCAPSULATION & BUSINESS LOGIC
   * Adds a transaction with validation and emits smart alerts.
   */
  public addTransaction(data: TransactionDTO): {
    success: boolean;
    transaction?: Transaction;
    alerts: string[];
    error?: string;
  } {
    if (!data.amount || data.amount <= 0) {
      return { success: false, alerts: [], error: 'Amount must be greater than zero.' };
    }
    if (!data.category || data.category.trim() === '') {
      return { success: false, alerts: [], error: 'Please select a valid category.' };
    }
    if (!data.source || data.source.trim() === '') {
      return {
        success: false,
        alerts: [],
        error: data.type === 'income' ? 'Please specify the income source.' : 'Please specify the payee/vendor.',
      };
    }

    let newTxn: Transaction;
    if (data.type === 'income') {
      newTxn = new IncomeTransaction(data);
    } else {
      newTxn = new ExpenseTransaction(data);
    }

    // Add to private storage
    this._transactions.unshift(newTxn);
    this.saveToLocalStorage();

    const alerts: string[] = [];

    // Smart Alert triggers
    if (newTxn.type === 'income') {
      alerts.push('Income recorded successfully.');
    } else {
      alerts.push('Transaction added successfully.');

      // Check if unusually high expense compared with previous transactions
      const previousExpenses = this._transactions.filter((t) => t.id !== newTxn.id && t.type === 'expense');
      if (previousExpenses.length >= 2) {
        const avgExpense = previousExpenses.reduce((s, t) => s + t.amount, 0) / previousExpenses.length;
        if (newTxn.amount > avgExpense * 2.2) {
          alerts.push('Your spending is higher than usual this time.');
        }
      }

      // Check budget limits for this category
      const currentMonth = newTxn.date.slice(0, 7);
      const budget = this._budgetManager.getBudget(newTxn.category, currentMonth);
      if (budget) {
        const status = budget.toStatusReport(this._transactions);
        if (status.status === 'exceeded') {
          alerts.push(`Budget exceeded for ${newTxn.category}. Consider reducing spending.`);
        } else if (status.status === 'warning') {
          alerts.push(`Warning: You have used ${status.percentage}% of your ${newTxn.category} budget.`);
        }
      }
    }

    return {
      success: true,
      transaction: newTxn,
      alerts,
    };
  }

  /**
   * Updates an existing transaction
   */
  public updateTransaction(id: string, updatedData: Partial<TransactionDTO>): boolean {
    const txn = this._transactions.find((t) => t.id === id);
    if (!txn) return false;

    txn.editTransaction(updatedData);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * Deletes a transaction by ID
   */
  public removeTransaction(id: string): boolean {
    const initialLength = this._transactions.length;
    this._transactions = this._transactions.filter((t) => t.id !== id);
    const removed = this._transactions.length < initialLength;
    if (removed) {
      this.saveToLocalStorage();
    }
    return removed;
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this._transactions.find((t) => t.id === id);
  }

  /**
   * =====================================================================
   * DYNAMIC CALCULATIONS (NO HARD-CODED VALUES)
   * All figures derive solely from the user's recorded transactions.
   * =====================================================================
   */
  public calculateIncome(): number {
    return this._transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public calculateExpenses(): number {
    return this._transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public calculateBalance(): number {
    return this.calculateIncome() - this.calculateExpenses();
  }

  public calculateSavings(): number {
    // Savings = Total Income - Total Expenses
    return this.calculateBalance();
  }

  public getCurrentMonthSpending(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return this._transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getCurrentMonthIncome(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return this._transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getAverageExpense(): number {
    const expenses = this._transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) return 0;
    return expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length;
  }

  /**
   * Multi-criteria filtering & search
   */
  public filterTransactions(filters: FilterOptions): Transaction[] {
    let result = [...this._transactions];

    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === filters.paymentMethod);
    }

    if (filters.startDate) {
      result = result.filter((t) => t.date >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter((t) => t.date <= filters.endDate!);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'amount-desc':
          result.sort((a, b) => b.amount - a.amount);
          break;
        case 'amount-asc':
          result.sort((a, b) => a.amount - b.amount);
          break;
        case 'date-asc':
          result.sort((a, b) => a.date.localeCompare(b.date));
          break;
        case 'date-desc':
        default:
          result.sort((a, b) => b.date.localeCompare(a.date));
          break;
      }
    } else {
      result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }

  /**
   * Aggregates expenses by category with percentages
   */
  public getCategorySpendingSummary(month?: string): {
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }[] {
    const list = this._transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      if (month && !t.date.startsWith(month)) return false;
      return true;
    });

    const total = list.reduce((s, t) => s + t.amount, 0);
    const catMap: Record<string, { amount: number; count: number }> = {};

    for (const t of list) {
      if (!catMap[t.category]) {
        catMap[t.category] = { amount: 0, count: 0 };
      }
      catMap[t.category].amount += t.amount;
      catMap[t.category].count += 1;
    }

    return Object.entries(catMap)
      .map(([category, val]) => ({
        category,
        amount: val.amount,
        count: val.count,
        percentage: total > 0 ? Math.round((val.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Monthly trend breakdown (last 6 months or all active months)
   */
  public getMonthlyTrend(monthsCount: number = 6): {
    month: string;
    monthLabel: string;
    income: number;
    expense: number;
    savings: number;
  }[] {
    const monthMap: Record<string, { income: number; expense: number }> = {};

    // Get current date and generate last N months keys
    const today = new Date();
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      monthMap[key] = { income: 0, expense: 0 };
    }

    // Populate from actual transactions
    for (const t of this._transactions) {
      const m = t.date.slice(0, 7);
      if (monthMap[m]) {
        if (t.type === 'income') {
          monthMap[m].income += t.amount;
        } else {
          monthMap[m].expense += t.amount;
        }
      }
    }

    return Object.entries(monthMap).map(([m, val]) => {
      const [year, monthNum] = m.split('-');
      const dateObj = new Date(Number(year), Number(monthNum) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return {
        month: m,
        monthLabel,
        income: val.income,
        expense: val.expense,
        savings: val.income - val.expense,
      };
    });
  }

  /**
   * Generates dynamic insights using InsightsEngine
   */
  public generateInsights(): ReturnType<typeof InsightsEngine.generateInsights> {
    return InsightsEngine.generateInsights(this._transactions, this._currentUser.currencyPreference);
  }

  /**
   * Data Persistence
   */
  public saveToLocalStorage(): void {
    try {
      const dtos = this._transactions.map((t) => t.toJSON());
      localStorage.setItem(FinanceManager.TXN_STORAGE_KEY, JSON.stringify(dtos));
      localStorage.setItem(FinanceManager.USER_STORAGE_KEY, JSON.stringify(this._currentUser.toProfileJSON()));
    } catch {
      // LocalStorage write error handling
    }
  }

  public loadFromLocalStorage(): void {
    try {
      const rawTxns = localStorage.getItem(FinanceManager.TXN_STORAGE_KEY);
      if (rawTxns) {
        const parsed = JSON.parse(rawTxns) as TransactionDTO[];
        this._transactions = parsed.map((item) => Transaction.fromJSON(item));
      } else {
        // Initial state must be completely empty: ₹0
        this._transactions = [];
      }

      const rawUser = localStorage.getItem(FinanceManager.USER_STORAGE_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        this._currentUser = User.fromStored(parsed);
      }
    } catch {
      this._transactions = [];
    }
  }

  public clearAllData(): void {
    this._transactions = [];
    localStorage.removeItem(FinanceManager.TXN_STORAGE_KEY);
  }

  /**
   * Export transactions to CSV format
   */
  public exportToCSV(): string {
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Source/Payee', 'Amount', 'Payment Method', 'Description'];
    const rows = this._transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.source.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${t.description.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Export to JSON string
   */
  public exportToJSON(): string {
    return JSON.stringify(this._transactions.map((t) => t.toJSON()), null, 2);
  }
}

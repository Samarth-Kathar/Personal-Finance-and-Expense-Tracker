export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'UPI' | 'Debit Card' | 'Bank Transfer' | 'Other';

export interface TransactionDTO {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  source: string; // Source for Income, Payee for Expense
  description: string;
  paymentMethod: PaymentMethod;
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  accountType: string;
  purpose: string;
  currencyPreference: string;
  profilePic: string;
  college?: string;
  academicYear?: string;
}

export interface BudgetDTO {
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface FilterOptions {
  type?: 'all' | 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  searchQuery?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'positive' | 'warning' | 'highlight';
  metric?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

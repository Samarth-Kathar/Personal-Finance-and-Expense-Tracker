import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinanceManager } from './models/FinanceManager';
import { User } from './models/User';
import { Transaction } from './models/Transaction';
import { TransactionDTO } from './types';
import { LoginPage } from './components/LoginPage';
import { TopNavbar, ActiveTab } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetView } from './components/BudgetView';
import { InsightsView } from './components/InsightsView';
import { ProfileView } from './components/ProfileView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();

  // Instantiate FinanceManager
  const financeManager = useMemo(() => new FinanceManager(), []);

  // Revision state counter to trigger re-renders when data updates
  const [revision, setRevision] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  // Session & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const local = localStorage.getItem('smartspend_session');
      const sess = sessionStorage.getItem('smartspend_session');
      if (local) {
        const parsed = JSON.parse(local);
        return Boolean(parsed.loggedIn);
      }
      if (sess) {
        const parsed = JSON.parse(sess);
        return Boolean(parsed.loggedIn);
      }
    } catch {
      return false;
    }
    return false;
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Transaction Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Dark / Light Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('smartspend_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smartspend_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smartspend_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    triggerRefresh();
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('smartspend_session');
    sessionStorage.removeItem('smartspend_session');
    setIsAuthenticated(false);
    showToast('Logged out successfully.', 'info', 'Session Ended');
  };

  // Add / Edit Transaction submission
  const handleFormSubmit = (data: TransactionDTO) => {
    if (editingTransaction) {
      const updated = financeManager.updateTransaction(editingTransaction.id, data);
      if (updated) {
        showToast('Transaction updated successfully.', 'success', 'Updated');
      } else {
        showToast('Failed to update transaction.', 'error', 'Error');
      }
      setEditingTransaction(null);
    } else {
      const result = financeManager.addTransaction(data);
      if (result.success) {
        // Emit smart alerts
        for (const alertText of result.alerts) {
          const isWarning = alertText.includes('Warning') || alertText.includes('higher than usual');
          const isExceeded = alertText.includes('exceeded') || alertText.includes('limit reached');

          if (isExceeded) {
            showToast(alertText, 'error', 'Budget Alert');
          } else if (isWarning) {
            showToast(alertText, 'warning', 'Smart Alert');
          } else {
            showToast(alertText, 'success', 'Recorded');
          }
        }
      } else {
        showToast(result.error || 'Could not record transaction.', 'error', 'Validation Failed');
      }
    }
    triggerRefresh();
  };

  // Edit transaction trigger
  const handleEditTransaction = (id: string) => {
    const txn = financeManager.getTransactionById(id);
    if (txn) {
      setEditingTransaction(txn);
      setIsFormModalOpen(true);
    }
  };

  // Delete transaction trigger
  const handleDeleteTransaction = (id: string) => {
    const removed = financeManager.removeTransaction(id);
    if (removed) {
      showToast('Transaction deleted successfully.', 'info', 'Ledger Updated');
      triggerRefresh();
    }
  };

  // Clear all data trigger
  const handleClearLedger = () => {
    financeManager.clearAllData();
    showToast('All transaction records have been reset to ₹0.', 'info', 'Reset Complete');
    triggerRefresh();
  };

  // If not authenticated, render LoginPage
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsFormModalOpen(true);
        }}
        user={financeManager.currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            key={`dash_${revision}`}
            financeManager={financeManager}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
            setActiveTab={setActiveTab}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            key={`txn_${revision}`}
            financeManager={financeManager}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            key={`ana_${revision}`}
            financeManager={financeManager}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            key={`bud_${revision}`}
            financeManager={financeManager}
            onRefresh={triggerRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            key={`ins_${revision}`}
            financeManager={financeManager}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            key={`prof_${revision}`}
            financeManager={financeManager}
            onProfileUpdated={triggerRefresh}
            showToast={showToast}
            onClearLedger={handleClearLedger}
          />
        )}
      </main>

      {/* Transaction Add/Edit Modal */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        currencySymbol={financeManager.currentUser.currencyPreference || '₹'}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            SmartSpend · Personal Finance &amp; Expense Tracker by <strong className="text-slate-700 dark:text-slate-300">Samarth Kathar</strong>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Student Financial Management</span>
            <span>·</span>
            <span>Real-time Dynamic Ledger</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Budgets &amp; Targets
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}

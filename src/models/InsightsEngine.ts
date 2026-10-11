import { InsightItem } from '../types';
import { Transaction } from './Transaction';

/**
 * =====================================================================
 * DOMAIN SERVICE & ANALYTICAL ABSTRACTION
 * InsightsEngine processes concrete transaction logs to derive meaningful
 * financial intelligence, patterns, and alerts for student life.
 * =====================================================================
 */
export class InsightsEngine {
  /**
   * Generates actionable insights purely derived from real user transactions.
   * If there are 0 transactions, returns empty array.
   */
  public static generateInsights(
    transactions: Transaction[],
    currencySymbol: string = '₹'
  ): InsightItem[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const insights: InsightItem[] = [];
    const currentDate = new Date();
    const currentMonthKey = currentDate.toISOString().slice(0, 7);

    // Current month transactions
    const currentMonthTxns = transactions.filter((t) => t.date.startsWith(currentMonthKey));
    
    // Categorize
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    const currentMonthExpenses = currentMonthTxns.filter((t) => t.type === 'expense');
    const currentMonthIncome = currentMonthTxns.filter((t) => t.type === 'income');
    const currentMonthExpenseTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const currentMonthIncomeTotal = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0);
    const currentMonthSavings = currentMonthIncomeTotal - currentMonthExpenseTotal;

    // 1. Current Month Top Expense Category
    if (currentMonthExpenses.length > 0) {
      const categoryTotals: Record<string, number> = {};
      for (const t of currentMonthExpenses) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }

      let topCategory = '';
      let topCategoryAmount = 0;
      for (const [cat, amt] of Object.entries(categoryTotals)) {
        if (amt > topCategoryAmount) {
          topCategoryAmount = amt;
          topCategory = cat;
        }
      }

      if (topCategory) {
        const pct = Math.round((topCategoryAmount / currentMonthExpenseTotal) * 100);
        insights.push({
          id: 'insight-top-expense-month',
          title: `Highest Spending in ${topCategory}`,
          description: `You spent most of your money on ${topCategory} this month (${currencySymbol}${topCategoryAmount.toLocaleString('en-IN')}, accounting for ${pct}% of monthly expenses).`,
          type: pct > 45 ? 'warning' : 'info',
          metric: `${pct}%`,
        });
      }
    } else if (expenses.length > 0) {
      // Overall top category if none in current month
      const categoryTotals: Record<string, number> = {};
      for (const t of expenses) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
      let topCategory = '';
      let topCategoryAmount = 0;
      for (const [cat, amt] of Object.entries(categoryTotals)) {
        if (amt > topCategoryAmount) {
          topCategoryAmount = amt;
          topCategory = cat;
        }
      }
      insights.push({
        id: 'insight-top-expense-overall',
        title: `Dominant Category: ${topCategory}`,
        description: `Your largest expense category across all time is ${topCategory} with ${currencySymbol}${topCategoryAmount.toLocaleString('en-IN')}.`,
        type: 'info',
      });
    }

    // 2. Income vs Expense Health & Monthly Savings
    if (currentMonthIncomeTotal > 0 || currentMonthExpenseTotal > 0) {
      if (currentMonthExpenseTotal > currentMonthIncomeTotal) {
        const deficit = currentMonthExpenseTotal - currentMonthIncomeTotal;
        insights.push({
          id: 'insight-deficit-warning',
          title: 'Expenses Exceed Income',
          description: `Your expenses are currently higher than your income by ${currencySymbol}${deficit.toLocaleString('en-IN')} this month. Watch out for non-essential spends.`,
          type: 'warning',
          metric: `-${currencySymbol}${deficit.toLocaleString('en-IN')}`,
        });
      } else if (currentMonthSavings > 0) {
        const savingsRate = Math.round((currentMonthSavings / currentMonthIncomeTotal) * 100);
        insights.push({
          id: 'insight-savings-positive',
          title: 'Positive Monthly Savings',
          description: `You have saved ${currencySymbol}${currentMonthSavings.toLocaleString('en-IN')} this month (${savingsRate}% student savings rate). Excellent financial control!`,
          type: 'positive',
          metric: `+${currencySymbol}${currentMonthSavings.toLocaleString('en-IN')}`,
        });
      }
    } else if (totalExpenses > totalIncome) {
      insights.push({
        id: 'insight-overall-deficit',
        title: 'Overall Balance Deficit',
        description: `Your cumulative expenses (${currencySymbol}${totalExpenses.toLocaleString('en-IN')}) exceed total income (${currencySymbol}${totalIncome.toLocaleString('en-IN')}).`,
        type: 'warning',
      });
    } else if (netSavings > 0) {
      insights.push({
        id: 'insight-overall-savings',
        title: 'Healthy Cumulative Savings',
        description: `You have an accumulated total savings of ${currencySymbol}${netSavings.toLocaleString('en-IN')}.`,
        type: 'positive',
        metric: `${currencySymbol}${netSavings.toLocaleString('en-IN')}`,
      });
    }

    // 3. Largest Single Transaction
    if (expenses.length > 0) {
      const maxExpense = expenses.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), expenses[0]);
      insights.push({
        id: 'insight-largest-single-expense',
        title: `Largest Outlay: ${maxExpense.category}`,
        description: `Your largest single expense is ${currencySymbol}${maxExpense.amount.toLocaleString('en-IN')} for ${maxExpense.category} (${maxExpense.source}) recorded on ${maxExpense.date}.`,
        type: 'highlight',
        metric: `${currencySymbol}${maxExpense.amount.toLocaleString('en-IN')}`,
      });
    }

    // 4. Month-over-Month Comparison (if multiple months of data exist)
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthKey = prevDate.toISOString().slice(0, 7);
    const prevMonthExpenses = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(prevMonthKey));

    if (prevMonthExpenses.length > 0 && currentMonthExpenses.length > 0) {
      const prevTotal = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const diff = currentMonthExpenseTotal - prevTotal;
      const diffPct = Math.round((Math.abs(diff) / prevTotal) * 100);

      if (diff > 0) {
        insights.push({
          id: 'insight-mom-increase',
          title: 'Monthly Spending Increase',
          description: `Your spending this month has increased by ${currencySymbol}${diff.toLocaleString('en-IN')} (${diffPct}%) compared to last month.`,
          type: 'warning',
        });
      } else if (diff < 0) {
        insights.push({
          id: 'insight-mom-decrease',
          title: 'Lower Monthly Spending',
          description: `Great job! Your spending this month is ${currencySymbol}${Math.abs(diff).toLocaleString('en-IN')} (${diffPct}%) lower than the previous month.`,
          type: 'positive',
        });
      }
    }

    // 5. Daily Average Spending
    if (currentMonthExpenses.length > 0) {
      const dayOfMonth = currentDate.getDate();
      const dailyAverage = Math.round(currentMonthExpenseTotal / dayOfMonth);
      insights.push({
        id: 'insight-daily-average',
        title: 'Daily Spending Average',
        description: `Your average daily spending this month is approximately ${currencySymbol}${dailyAverage.toLocaleString('en-IN')} per day.`,
        type: 'info',
        metric: `${currencySymbol}${dailyAverage}/day`,
      });
    }

    return insights;
  }
}

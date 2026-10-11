export const INCOME_CATEGORIES = [
  'Parents',
  'Father',
  'Mother',
  'Friends',
  'Scholarship',
  'Part-time Work',
  'Freelance',
  'Other',
] as const;

export const EXPENSE_CATEGORIES = [
  'College Canteen',
  'Stationery',
  'College Fees',
  'Books',
  'Transport',
  'Bus',
  'Auto/Rickshaw',
  'Mobile Recharge',
  'Internet',
  'Food',
  'Snacks',
  'Entertainment',
  'Shopping',
  'Hostel',
  'Electricity Bill',
  'Medical',
  'Coursework & Lab Expenses',
  'Printing',
  'Examination Fees',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Bank Transfer',
  'Other',
] as const;

export const BUDGET_DEFAULT_CATEGORIES = [
  'Food',
  'Canteen',
  'Transport',
  'Stationery',
  'Entertainment',
  'Shopping',
  'College Expenses',
  'Other',
] as const;

// Example transaction placeholders for input forms
export const FORM_PLACEHOLDER_EXAMPLES = {
  income: {
    amount: '5000',
    source: 'e.g. Parents, Father, or Freelance client',
    description: 'e.g. Monthly college allowance from parents',
    category: 'Parents',
  },
  expense: {
    amount: '250',
    source: 'e.g. Campus Stationery Store, Canteen, or Bus Conductor',
    description: 'e.g. Notebooks, engineering lab record sheets, and pens',
    category: 'Stationery',
  },
};

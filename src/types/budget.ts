export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  paidBy: 'partner1' | 'partner2';
  splitType: 'equal' | 'custom' | 'full';
  splitPercentage?: number; // For custom splits
  receiptPhoto?: string;
  linkedEventId?: string; // Link to calendar events
  tags: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  currentSpent: number;
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  isActive: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'home' | 'wedding' | 'emergency' | 'other';
  description?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  type: 'savings' | 'debt_payoff' | 'investment';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetSettings {
  currency: string;
  partner1Name: string;
  partner2Name: string;
  monthlyIncome: number;
  alertsEnabled: boolean;
  emailNotifications: boolean;
}

export interface CoupleContribution {
  partner1Total: number;
  partner2Total: number;
  combinedTotal: number;
  period: string; // Date range or period identifier
}

export type ContributionPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface MonthlyReport {
  month: string; // YYYY-MM format
  totalSpent: number;
  budgetUtilization: number; // Percentage
  categoryBreakdown: Record<ExpenseCategory, number>;
  savingsRate: number;
  topExpenses: Expense[];
}

export type ExpenseCategory = 
  | 'restaurants'
  | 'entertainment'
  | 'travel'
  | 'gifts'
  | 'activities'
  | 'groceries'
  | 'transportation'
  | 'utilities'
  | 'subscriptions'
  | 'healthcare'
  | 'shopping'
  | 'other';

export interface CustomReport {
  id: string;
  title: string;
  description?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  categories: ExpenseCategory[];
  reportType: 'spending' | 'budget' | 'savings' | 'comparison';
  createdDate: string;
  lastModified: string;
  isPublic: boolean;
}

export interface BudgetAnalytics {
  monthlyTrends: {
    month: string;
    totalSpent: number;
    budgetUtilization: number;
  }[];
  categoryTrends: Record<ExpenseCategory, number[]>;
  averageMonthlySpending: number;
  predictedMonthlySpending: number;
  savingsRate: number;
  topCategories: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
}

export interface BudgetError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: BudgetError[];
}

export interface BudgetContextType {
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  financialGoals: FinancialGoal[];
  customReports: CustomReport[];
  settings: BudgetSettings;
  analytics: BudgetAnalytics;
  
  // Expense management
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<string>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  deleteMultipleExpenses: (ids: string[]) => Promise<boolean>;
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
  getExpenseById: (id: string) => Expense | undefined;
  duplicateExpense: (id: string) => Promise<string>;
  
  // Budget management
  addBudget: (budget: Omit<Budget, 'id' | 'currentSpent'>) => Promise<string>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
  getBudgetByCategory: (category: ExpenseCategory) => Budget | undefined;
  getBudgetById: (id: string) => Budget | undefined;
  resetBudgetSpending: (id: string) => Promise<boolean>;
  
  // Savings goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<string>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<boolean>;
  deleteSavingsGoal: (id: string) => Promise<boolean>;
  getSavingsGoalById: (id: string) => SavingsGoal | undefined;
  addToSavingsGoal: (id: string, amount: number) => Promise<boolean>;
  
  // Financial goals
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<string>;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<boolean>;
  deleteFinancialGoal: (id: string) => Promise<boolean>;
  getFinancialGoalById: (id: string) => FinancialGoal | undefined;
  
  // Custom Reports & Analytics CRUD
  addCustomReport: (report: Omit<CustomReport, 'id' | 'createdDate' | 'lastModified'>) => Promise<string>;
  updateCustomReport: (id: string, updates: Partial<CustomReport>) => Promise<boolean>;
  deleteCustomReport: (id: string) => Promise<boolean>;
  getCustomReportById: (id: string) => CustomReport | undefined;
  generateReportData: (reportId: string) => any;
  
  // Settings CRUD
  updateSettings: (settings: Partial<BudgetSettings>) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
  
  // Analytics
  getMonthlyReport: (month: string) => MonthlyReport;
  calculateBalance: () => { partner1Owes: number; partner2Owes: number };
  calculateCoupleContribution: (period: ContributionPeriod, date?: Date) => CoupleContribution;
  refreshAnalytics: () => void;
  
  // Validation
  validateExpense: (expense: Partial<Expense>) => ValidationResult;
  validateBudget: (budget: Partial<Budget>) => ValidationResult;
  validateSavingsGoal: (goal: Partial<SavingsGoal>) => ValidationResult;
  validateFinancialGoal: (goal: Partial<FinancialGoal>) => ValidationResult;
  
  // Utility functions
  getTotalSpentThisMonth: () => number;
  getBudgetUtilization: (category: ExpenseCategory) => number;
  getUpcomingBills: () => Expense[];
  exportData: () => string;
  importData: (dataJson: string) => Promise<boolean>;
  clearAllData: () => Promise<boolean>;
  
  // Search and filter
  searchExpenses: (query: string) => Expense[];
  filterExpenses: (filters: Partial<Expense>) => Expense[];
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  Expense, 
  Budget, 
  SavingsGoal, 
  FinancialGoal, 
  BudgetSettings, 
  BudgetAnalytics, 
  BudgetContextType,
  ExpenseCategory,
  MonthlyReport,
  CustomReport,
  ValidationResult,
  BudgetError
} from '../types/budget';

const defaultSettings: BudgetSettings = {
  currency: 'PHP',
  partner1Name: 'Partner 1',
  partner2Name: 'Partner 2',
  monthlyIncome: 0,
  alertsEnabled: true,
  emailNotifications: false,
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [settings, setSettings] = useState<BudgetSettings>(defaultSettings);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('budget-expenses');
    const savedBudgets = localStorage.getItem('budget-budgets');
    const savedSavingsGoals = localStorage.getItem('budget-savings-goals');
    const savedFinancialGoals = localStorage.getItem('budget-financial-goals');
    const savedCustomReports = localStorage.getItem('budget-custom-reports');
    const savedSettings = localStorage.getItem('budget-settings');

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedSavingsGoals) setSavingsGoals(JSON.parse(savedSavingsGoals));
    if (savedFinancialGoals) setFinancialGoals(JSON.parse(savedFinancialGoals));
    if (savedCustomReports) setCustomReports(JSON.parse(savedCustomReports));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budget-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('budget-savings-goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('budget-financial-goals', JSON.stringify(financialGoals));
  }, [financialGoals]);

  useEffect(() => {
    localStorage.setItem('budget-custom-reports', JSON.stringify(customReports));
  }, [customReports]);

  useEffect(() => {
    localStorage.setItem('budget-settings', JSON.stringify(settings));
  }, [settings]);

  // Validation functions
  const validateExpense = (expense: Partial<Expense>): ValidationResult => {
    const errors: BudgetError[] = [];

    if (!expense.amount || expense.amount <= 0) {
      errors.push({ code: 'INVALID_AMOUNT', message: 'Amount must be greater than 0', field: 'amount' });
    }
    if (!expense.category) {
      errors.push({ code: 'MISSING_CATEGORY', message: 'Category is required', field: 'category' });
    }
    if (!expense.description?.trim()) {
      errors.push({ code: 'MISSING_DESCRIPTION', message: 'Description is required', field: 'description' });
    }
    if (!expense.date) {
      errors.push({ code: 'MISSING_DATE', message: 'Date is required', field: 'date' });
    }
    if (!expense.paidBy) {
      errors.push({ code: 'MISSING_PAID_BY', message: 'Paid by is required', field: 'paidBy' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateBudget = (budget: Partial<Budget>): ValidationResult => {
    const errors: BudgetError[] = [];

    if (!budget.category) {
      errors.push({ code: 'MISSING_CATEGORY', message: 'Category is required', field: 'category' });
    }
    if (!budget.monthlyLimit || budget.monthlyLimit <= 0) {
      errors.push({ code: 'INVALID_MONTHLY_LIMIT', message: 'Monthly limit must be greater than 0', field: 'monthlyLimit' });
    }
    if (budget.alertThreshold && (budget.alertThreshold < 0 || budget.alertThreshold > 100)) {
      errors.push({ code: 'INVALID_ALERT_THRESHOLD', message: 'Alert threshold must be between 0 and 100', field: 'alertThreshold' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateSavingsGoal = (goal: Partial<SavingsGoal>): ValidationResult => {
    const errors: BudgetError[] = [];

    if (!goal.title?.trim()) {
      errors.push({ code: 'MISSING_TITLE', message: 'Title is required', field: 'title' });
    }
    if (!goal.targetAmount || goal.targetAmount <= 0) {
      errors.push({ code: 'INVALID_TARGET_AMOUNT', message: 'Target amount must be greater than 0', field: 'targetAmount' });
    }
    if (!goal.targetDate) {
      errors.push({ code: 'MISSING_TARGET_DATE', message: 'Target date is required', field: 'targetDate' });
    }
    if (goal.currentAmount && goal.currentAmount < 0) {
      errors.push({ code: 'INVALID_CURRENT_AMOUNT', message: 'Current amount cannot be negative', field: 'currentAmount' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateFinancialGoal = (goal: Partial<FinancialGoal>): ValidationResult => {
    const errors: BudgetError[] = [];

    if (!goal.title?.trim()) {
      errors.push({ code: 'MISSING_TITLE', message: 'Title is required', field: 'title' });
    }
    if (!goal.type) {
      errors.push({ code: 'MISSING_TYPE', message: 'Type is required', field: 'type' });
    }
    if (!goal.targetAmount || goal.targetAmount <= 0) {
      errors.push({ code: 'INVALID_TARGET_AMOUNT', message: 'Target amount must be greater than 0', field: 'targetAmount' });
    }
    if (!goal.targetDate) {
      errors.push({ code: 'MISSING_TARGET_DATE', message: 'Target date is required', field: 'targetDate' });
    }
    if (goal.monthlyContribution && goal.monthlyContribution < 0) {
      errors.push({ code: 'INVALID_MONTHLY_CONTRIBUTION', message: 'Monthly contribution cannot be negative', field: 'monthlyContribution' });
    }

    return { isValid: errors.length === 0, errors };
  };

  // Enhanced Expense management
  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
    const validation = validateExpense(expense);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Update budget current spent
    const budget = budgets.find(b => b.category === expense.category);
    if (budget) {
      await updateBudget(budget.id, { 
        currentSpent: budget.currentSpent + expense.amount 
      });
    }

    return newExpense.id;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<boolean> => {
    const existingExpense = expenses.find(e => e.id === id);
    if (!existingExpense) return false;

    const updatedExpense = { ...existingExpense, ...updates };
    const validation = validateExpense(updatedExpense);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    setExpenses(prev => prev.map(expense => 
      expense.id === id ? updatedExpense : expense
    ));

    // Update budget if category or amount changed
    if (updates.category || updates.amount) {
      const oldBudget = budgets.find(b => b.category === existingExpense.category);
      const newBudget = budgets.find(b => b.category === updatedExpense.category);

      if (oldBudget && oldBudget.id !== newBudget?.id) {
        await updateBudget(oldBudget.id, { 
          currentSpent: Math.max(0, oldBudget.currentSpent - existingExpense.amount) 
        });
      }

      if (newBudget) {
        const amountDiff = updatedExpense.amount - (oldBudget?.id === newBudget.id ? existingExpense.amount : 0);
        await updateBudget(newBudget.id, { 
          currentSpent: newBudget.currentSpent + amountDiff 
        });
      }
    }

    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return false;

    setExpenses(prev => prev.filter(e => e.id !== id));
    
    // Update budget current spent
    const budget = budgets.find(b => b.category === expense.category);
    if (budget) {
      await updateBudget(budget.id, { 
        currentSpent: Math.max(0, budget.currentSpent - expense.amount) 
      });
    }

    return true;
  };

  const deleteMultipleExpenses = async (ids: string[]): Promise<boolean> => {
    try {
      for (const id of ids) {
        await deleteExpense(id);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const getExpenseById = (id: string): Expense | undefined => {
    return expenses.find(expense => expense.id === id);
  };

  const duplicateExpense = async (id: string): Promise<string> => {
    const expense = getExpenseById(id);
    if (!expense) throw new Error('Expense not found');

    const { id: _, ...expenseData } = expense;
    const duplicatedExpense = {
      ...expenseData,
      description: `${expenseData.description} (Copy)`,
      date: new Date().toISOString().split('T')[0],
    };

    return await addExpense(duplicatedExpense);
  };

  const getExpensesByCategory = (category: ExpenseCategory) => {
    return expenses.filter(expense => expense.category === category);
  };

  const getExpensesByDateRange = (startDate: string, endDate: string) => {
    return expenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  };

  // Enhanced Budget management
  const addBudget = async (budget: Omit<Budget, 'id' | 'currentSpent'>): Promise<string> => {
    const validation = validateBudget(budget);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === budget.category);
    if (existingBudget) {
      throw new Error('Budget for this category already exists');
    }

    const currentSpent = getExpensesByCategory(budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      currentSpent,
    };

    setBudgets(prev => [newBudget, ...prev]);
    return newBudget.id;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>): Promise<boolean> => {
    const existingBudget = budgets.find(b => b.id === id);
    if (!existingBudget) return false;

    const updatedBudget = { ...existingBudget, ...updates };
    const validation = validateBudget(updatedBudget);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    setBudgets(prev => prev.map(budget => 
      budget.id === id ? updatedBudget : budget
    ));

    return true;
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return false;

    setBudgets(prev => prev.filter(budget => budget.id !== id));
    return true;
  };

  const getBudgetByCategory = (category: ExpenseCategory) => {
    return budgets.find(budget => budget.category === category);
  };

  const getBudgetById = (id: string): Budget | undefined => {
    return budgets.find(budget => budget.id === id);
  };

  const resetBudgetSpending = async (id: string): Promise<boolean> => {
    const budget = getBudgetById(id);
    if (!budget) return false;

    const currentSpent = getExpensesByCategory(budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return await updateBudget(id, { currentSpent });
  };

  // Enhanced Savings goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>): Promise<string> => {
    const validation = validateSavingsGoal(goal);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setSavingsGoals(prev => [newGoal, ...prev]);
    return newGoal.id;
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>): Promise<boolean> => {
    const existingGoal = savingsGoals.find(g => g.id === id);
    if (!existingGoal) return false;

    const updatedGoal = { ...existingGoal, ...updates };
    const validation = validateSavingsGoal(updatedGoal);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id ? updatedGoal : goal
    ));

    return true;
  };

  const deleteSavingsGoal = async (id: string): Promise<boolean> => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return false;

    setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
    return true;
  };

  const getSavingsGoalById = (id: string): SavingsGoal | undefined => {
    return savingsGoals.find(goal => goal.id === id);
  };

  const addToSavingsGoal = async (id: string, amount: number): Promise<boolean> => {
    const goal = getSavingsGoalById(id);
    if (!goal || amount <= 0) return false;

    const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    return await updateSavingsGoal(id, { currentAmount: newCurrentAmount });
  };

  // Enhanced Financial goals
  const addFinancialGoal = async (goal: Omit<FinancialGoal, 'id'>): Promise<string> => {
    const validation = validateFinancialGoal(goal);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const newGoal: FinancialGoal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setFinancialGoals(prev => [newGoal, ...prev]);
    return newGoal.id;
  };

  const updateFinancialGoal = async (id: string, updates: Partial<FinancialGoal>): Promise<boolean> => {
    const existingGoal = financialGoals.find(g => g.id === id);
    if (!existingGoal) return false;

    const updatedGoal = { ...existingGoal, ...updates };
    const validation = validateFinancialGoal(updatedGoal);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    setFinancialGoals(prev => prev.map(goal => 
      goal.id === id ? updatedGoal : goal
    ));

    return true;
  };

  const deleteFinancialGoal = async (id: string): Promise<boolean> => {
    const goal = financialGoals.find(g => g.id === id);
    if (!goal) return false;

    setFinancialGoals(prev => prev.filter(goal => goal.id !== id));
    return true;
  };

  const getFinancialGoalById = (id: string): FinancialGoal | undefined => {
    return financialGoals.find(goal => goal.id === id);
  };

  // Custom Reports & Analytics CRUD
  const addCustomReport = async (report: Omit<CustomReport, 'id' | 'createdDate' | 'lastModified'>): Promise<string> => {
    if (!report.title?.trim()) {
      throw new Error('Report title is required');
    }

    const now = new Date().toISOString();
    const newReport: CustomReport = {
      ...report,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdDate: now,
      lastModified: now,
    };

    setCustomReports(prev => [newReport, ...prev]);
    return newReport.id;
  };

  const updateCustomReport = async (id: string, updates: Partial<CustomReport>): Promise<boolean> => {
    const existingReport = customReports.find(r => r.id === id);
    if (!existingReport) return false;

    const updatedReport = {
      ...existingReport,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    setCustomReports(prev => prev.map(report => 
      report.id === id ? updatedReport : report
    ));

    return true;
  };

  const deleteCustomReport = async (id: string): Promise<boolean> => {
    const report = customReports.find(r => r.id === id);
    if (!report) return false;

    setCustomReports(prev => prev.filter(report => report.id !== id));
    return true;
  };

  const getCustomReportById = (id: string): CustomReport | undefined => {
    return customReports.find(report => report.id === id);
  };

  const generateReportData = (reportId: string) => {
    const report = getCustomReportById(reportId);
    if (!report) return null;

    const reportExpenses = getExpensesByDateRange(
      report.dateRange.startDate,
      report.dateRange.endDate
    ).filter(expense => 
      report.categories.length === 0 || report.categories.includes(expense.category)
    );

    const totalSpent = reportExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = reportExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return {
      report,
      expenses: reportExpenses,
      totalSpent,
      categoryBreakdown,
      expenseCount: reportExpenses.length,
    };
  };

  // Enhanced Settings CRUD
  const updateSettings = async (newSettings: Partial<BudgetSettings>): Promise<boolean> => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetSettings = async (): Promise<boolean> => {
    try {
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      return false;
    }
  };

  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson: string): Promise<boolean> => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      setSettings(importedSettings);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Analytics
  const getMonthlyReport = (month: string): MonthlyReport => {
    const monthExpenses = expenses.filter(expense => 
      expense.date.startsWith(month)
    );
    
    const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const categoryBreakdown = monthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
    
    const topExpenses = monthExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      month,
      totalSpent,
      budgetUtilization,
      categoryBreakdown,
      savingsRate: 0, // Calculate based on income vs spending
      topExpenses,
    };
  };

  const calculateBalance = () => {
    const partner1Expenses = expenses.filter(e => e.paidBy === 'partner1');
    const partner2Expenses = expenses.filter(e => e.paidBy === 'partner2');
    
    const partner1Total = partner1Expenses.reduce((sum, e) => sum + e.amount, 0);
    const partner2Total = partner2Expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const difference = partner1Total - partner2Total;
    
    return {
      partner1Owes: difference < 0 ? Math.abs(difference) / 2 : 0,
      partner2Owes: difference > 0 ? difference / 2 : 0,
    };
  };

  const calculateCoupleContribution = (period: 'daily' | 'weekly' | 'monthly' | 'yearly', date?: Date) => {
    const targetDate = date || new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    switch (period) {
      case 'daily':
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        periodLabel = startDate.toLocaleDateString();
        break;
      case 'weekly':
        const dayOfWeek = targetDate.getDay();
        startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        periodLabel = `Week of ${startDate.toLocaleDateString()}`;
        break;
      case 'monthly':
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
        periodLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        break;
      case 'yearly':
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear() + 1, 0, 1);
        periodLabel = targetDate.getFullYear().toString();
        break;
    }

    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate < endDate;
    });

    const partner1Total = periodExpenses
      .filter(e => e.paidBy === 'partner1')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const partner2Total = periodExpenses
      .filter(e => e.paidBy === 'partner2')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      partner1Total,
      partner2Total,
      combinedTotal: partner1Total + partner2Total,
      period: periodLabel
    };
  };

  const refreshAnalytics = () => {
    // Trigger re-calculation of analytics
    // This could be expanded to include more complex analytics calculations
  };

  // Utility functions
  const getTotalSpentThisMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return getExpensesByDateRange(currentMonth + '-01', currentMonth + '-31')
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBudgetUtilization = (category: ExpenseCategory) => {
    const budget = getBudgetByCategory(category);
    if (!budget || budget.monthlyLimit === 0) return 0;
    return (budget.currentSpent / budget.monthlyLimit) * 100;
  };

  const getUpcomingBills = () => {
    return expenses.filter(expense => expense.isRecurring);
  };

  const exportData = () => {
    const data = {
      expenses,
      budgets,
      savingsGoals,
      financialGoals,
      customReports,
      settings,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = async (dataJson: string): Promise<boolean> => {
    try {
      const data = JSON.parse(dataJson);
      
      if (data.expenses) setExpenses(data.expenses);
      if (data.budgets) setBudgets(data.budgets);
      if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
      if (data.financialGoals) setFinancialGoals(data.financialGoals);
      if (data.customReports) setCustomReports(data.customReports);
      if (data.settings) setSettings(data.settings);
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearAllData = async (): Promise<boolean> => {
    try {
      setExpenses([]);
      setBudgets([]);
      setSavingsGoals([]);
      setFinancialGoals([]);
      setCustomReports([]);
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Search and filter
  const searchExpenses = (query: string): Expense[] => {
    const lowercaseQuery = query.toLowerCase();
    return expenses.filter(expense =>
      expense.description.toLowerCase().includes(lowercaseQuery) ||
      expense.category.toLowerCase().includes(lowercaseQuery) ||
      expense.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filterExpenses = (filters: Partial<Expense>): Expense[] => {
    return expenses.filter(expense => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        return expense[key as keyof Expense] === value;
      });
    });
  };

  // Calculate analytics
  const analytics: BudgetAnalytics = {
    monthlyTrends: [],
    categoryTrends: {} as Record<ExpenseCategory, number[]>,
    averageMonthlySpending: getTotalSpentThisMonth(),
    predictedMonthlySpending: getTotalSpentThisMonth() * 1.1, // Simple prediction
    savingsRate: 0,
    topCategories: [],
  };

  const contextValue: BudgetContextType = {
    expenses,
    budgets,
    savingsGoals,
    financialGoals,
    customReports,
    settings,
    analytics,
    
    // Expense management
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultipleExpenses,
    getExpensesByCategory,
    getExpensesByDateRange,
    getExpenseById,
    duplicateExpense,
    
    // Budget management
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategory,
    getBudgetById,
    resetBudgetSpending,
    
    // Savings goals
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsGoalById,
    addToSavingsGoal,
    
    // Financial goals
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    getFinancialGoalById,
    
    // Custom Reports & Analytics CRUD
    addCustomReport,
    updateCustomReport,
    deleteCustomReport,
    getCustomReportById,
    generateReportData,
    
    // Settings CRUD
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    
    // Analytics
    getMonthlyReport,
    calculateBalance,
    calculateCoupleContribution,
    refreshAnalytics,
    
    // Validation
    validateExpense,
    validateBudget,
    validateSavingsGoal,
    validateFinancialGoal,
    
    // Utility functions
    getTotalSpentThisMonth,
    getBudgetUtilization,
    getUpcomingBills,
    exportData,
    importData,
    clearAllData,
    
    // Search and filter
    searchExpenses,
    filterExpenses,
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};
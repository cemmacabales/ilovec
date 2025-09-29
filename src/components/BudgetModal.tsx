import React, { useState } from 'react';
import { 
  MdClose, 
  MdAdd, 
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdSavings,
  MdPieChart,
  MdCalendarToday,
  MdNotifications,
  MdSettings,
  MdAttachMoney,
  MdReceipt,
  MdGpsFixed,
  MdWarning,
  MdCheckCircle,
  MdEdit,
  MdDelete,
  MdFileDownload,
  MdUpload,
  MdSearch,
  MdPerson,
  MdShowChart
} from 'react-icons/md';
import { useBudget } from '../contexts/BudgetContext';
import type { Expense, ExpenseCategory, Budget, SavingsGoal } from '../types/budget';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'overview' | 'expenses' | 'budgets' | 'goals' | 'settings';

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [contributionPeriod, setContributionPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const {
    expenses,
    budgets,
    savingsGoals,
    settings,
    addExpense,
    addBudget,
    addSavingsGoal,
    getTotalSpentThisMonth,
    calculateCoupleContribution,
    getExpensesByCategory,
    getBudgetUtilization,
    updateExpense,
    deleteExpense,
    updateBudget,
    deleteBudget,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateSettings
  } = useBudget();

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'restaurants' as ExpenseCategory,
    description: '',
    date: new Date().toISOString().slice(0, 10),
    paidBy: 'partner1' as 'partner1' | 'partner2',
    splitType: 'equal' as 'equal' | 'custom' | 'full',
    splitPercentage: 50,
    tags: [] as string[],
    isRecurring: false
  });

  const [newBudget, setNewBudget] = useState({
    category: 'restaurants' as ExpenseCategory,
    monthlyLimit: '',
    alertThreshold: 80,
    isActive: true
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'vacation' as 'vacation' | 'home' | 'wedding' | 'emergency' | 'other',
    description: ''
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentView('overview');
      setShowAddExpense(false);
      setShowAddBudget(false);
      setShowAddGoal(false);
    }, 200);
  };

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      addExpense({
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date,
        paidBy: newExpense.paidBy,
        splitType: newExpense.splitType,
        splitPercentage: newExpense.splitPercentage,
        tags: newExpense.tags,
        isRecurring: newExpense.isRecurring
      });
      setNewExpense({
        amount: '',
        category: 'restaurants',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        paidBy: 'partner1',
        splitType: 'equal',
        splitPercentage: 50,
        tags: [],
        isRecurring: false
      });
      setShowAddExpense(false);
    }
  };

  const handleAddBudget = () => {
    if (newBudget.monthlyLimit) {
      addBudget({
        category: newBudget.category,
        monthlyLimit: parseFloat(newBudget.monthlyLimit),
        alertThreshold: newBudget.alertThreshold,
        isActive: newBudget.isActive
      });
      setNewBudget({
        category: 'restaurants',
        monthlyLimit: '',
        alertThreshold: 80,
        isActive: true
      });
      setShowAddBudget(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.targetAmount) {
      addSavingsGoal({
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount) || 0,
        targetDate: newGoal.targetDate,
        category: newGoal.category,
        description: newGoal.description
      });
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: 'vacation',
        description: ''
      });
      setShowAddGoal(false);
    }
  };

  // Edit handlers
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date,
      paidBy: expense.paidBy,
      splitType: expense.splitType || 'equal',
      splitPercentage: expense.splitPercentage || 50,
      tags: expense.tags || [],
      isRecurring: expense.isRecurring || false
    });
    setShowEditExpense(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setNewBudget({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit.toString(),
      alertThreshold: budget.alertThreshold,
      isActive: budget.isActive
    });
    setShowEditBudget(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      description: goal.description || ''
    });
    setShowEditGoal(true);
  };

  // Update handlers
  const handleUpdateExpense = async () => {
    if (editingExpense && newExpense.amount && newExpense.description) {
      try {
        await updateExpense(editingExpense.id, {
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          description: newExpense.description,
          date: newExpense.date,
          paidBy: newExpense.paidBy,
          splitType: newExpense.splitType,
          splitPercentage: newExpense.splitPercentage,
          tags: newExpense.tags,
          isRecurring: newExpense.isRecurring
        });
        setShowEditExpense(false);
        setEditingExpense(null);
        resetExpenseForm();
      } catch (error) {
        console.error('Failed to update expense:', error);
      }
    }
  };

  const handleUpdateBudget = async () => {
    if (editingBudget && newBudget.monthlyLimit) {
      try {
        await updateBudget(editingBudget.id, {
          category: newBudget.category,
          monthlyLimit: parseFloat(newBudget.monthlyLimit),
          alertThreshold: newBudget.alertThreshold,
          isActive: newBudget.isActive
        });
        setShowEditBudget(false);
        setEditingBudget(null);
        resetBudgetForm();
      } catch (error) {
        console.error('Failed to update budget:', error);
      }
    }
  };

  const handleUpdateGoal = async () => {
    if (editingGoal && newGoal.title && newGoal.targetAmount) {
      try {
        await updateSavingsGoal(editingGoal.id, {
          title: newGoal.title,
          targetAmount: parseFloat(newGoal.targetAmount),
          currentAmount: parseFloat(newGoal.currentAmount) || 0,
          targetDate: newGoal.targetDate,
          category: newGoal.category,
          description: newGoal.description
        });
        setShowEditGoal(false);
        setEditingGoal(null);
        resetGoalForm();
      } catch (error) {
        console.error('Failed to update goal:', error);
      }
    }
  };

  // Delete handlers with confirmation
  const confirmDelete = (action: () => void) => {
    setDeleteAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteAction) {
      try {
        await deleteAction();
        setShowConfirmDialog(false);
        setDeleteAction(null);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  // Reset form functions
  const resetExpenseForm = () => {
    setNewExpense({
      amount: '',
      category: 'restaurants',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      paidBy: 'partner1',
      splitType: 'equal',
      splitPercentage: 50,
      tags: [],
      isRecurring: false
    });
  };

  const resetBudgetForm = () => {
    setNewBudget({
      category: 'restaurants',
      monthlyLimit: '',
      alertThreshold: 80,
      isActive: true
    });
  };

  const resetGoalForm = () => {
    setNewGoal({
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'vacation',
      description: ''
    });
  };

  const categories: ExpenseCategory[] = [
    'restaurants', 'entertainment', 'travel', 'gifts', 'activities',
    'groceries', 'transportation', 'utilities', 'subscriptions',
    'healthcare', 'shopping', 'other'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;
    
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }
    
    return filtered;
  };

  const totalSpentThisMonth = getTotalSpentThisMonth();
  const recentExpenses = expenses.slice(0, 5);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpentThisMonth / totalBudget) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content budget-modal ${isClosing ? 'modal-content-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="budget-header-left">
            <h2>
              <MdAccountBalanceWallet style={{ marginRight: '8px' }} />
              Budget Tracker
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b6358', fontSize: '14px' }}>
              Manage your shared expenses and financial goals
            </p>
          </div>
          <div className="budget-header-right">
            <div className="view-controls">
              <button 
                className={`view-btn ${currentView === 'overview' ? 'active' : ''}`}
                onClick={() => setCurrentView('overview')}
              >
                <MdPieChart /> Overview
              </button>
              <button 
                className={`view-btn ${currentView === 'expenses' ? 'active' : ''}`}
                onClick={() => setCurrentView('expenses')}
              >
                <MdReceipt /> Expenses
              </button>
              <button 
                className={`view-btn ${currentView === 'budgets' ? 'active' : ''}`}
                onClick={() => setCurrentView('budgets')}
              >
                <MdGpsFixed /> Budgets
              </button>

              <button 
                className={`view-btn ${currentView === 'goals' ? 'active' : ''}`}
                onClick={() => setCurrentView('goals')}
              >
                <MdSavings /> Goals
              </button>
              <button 
                className={`view-btn ${currentView === 'settings' ? 'active' : ''}`}
                onClick={() => setCurrentView('settings')}
              >
                <MdSettings /> Settings
              </button>
            </div>
            <button className="close-button" onClick={handleClose}>
              <MdClose />
            </button>
          </div>
        </div>

        <div className="modal-body budget-body">
          {currentView === 'overview' && (
            <div className="budget-overview">
              <div className="bento-grid">
                {/* Quick Stats - Large Card */}
                <div className="bento-card large stats-card">
                  <h3><MdTrendingUp /> This Month</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">{formatCurrency(totalSpentThisMonth)}</div>
                      <div className="stat-label">Total Spent</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{formatCurrency(totalBudget)}</div>
                      <div className="stat-label">Total Budget</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{budgetUtilization.toFixed(1)}%</div>
                      <div className="stat-label">Budget Used</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{expenses.length}</div>
                      <div className="stat-label">Transactions</div>
                    </div>
                  </div>
                </div>

                {/* Quick Add Expense */}
                <div className="bento-card medium add-expense-card">
                  <h3><MdAdd /> Quick Add Expense</h3>
                  <button 
                    className="quick-add-btn"
                    onClick={() => setShowAddExpense(true)}
                  >
                    <MdReceipt />
                    Add New Expense
                  </button>
                </div>

                {/* Couple Contribution Tracker */}
                <div className="bento-card medium contribution-card">
                  <div className="card-header">
                    <h3><MdShowChart /> Couple Contributions</h3>
                    <select 
                      value={contributionPeriod} 
                      onChange={(e) => setContributionPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                      className="period-filter"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="contribution-info">
                    {(() => {
                      const contribution = calculateCoupleContribution(contributionPeriod);
                      return (
                        <>
                          <div className="contribution-period">
                            <span className="period-label">{contribution.period}</span>
                          </div>
                          <div className="contribution-item">
                            <span className="partner-name">{settings.partner1Name}</span>
                            <span className="contribution-amount">{formatCurrency(contribution.partner1Total)}</span>
                          </div>
                          <div className="contribution-item">
                            <span className="partner-name">{settings.partner2Name}</span>
                            <span className="contribution-amount">{formatCurrency(contribution.partner2Total)}</span>
                          </div>
                          <div className="contribution-total">
                            <span className="total-label">Combined Total</span>
                            <span className="total-amount">{formatCurrency(contribution.combinedTotal)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Recent Expenses */}
                <div className="bento-card large recent-expenses-card">
                  <h3><MdReceipt /> Recent Expenses</h3>
                  <div className="expenses-list">
                    {recentExpenses.map(expense => (
                      <div key={expense.id} className="expense-item">
                        <div className="expense-info">
                          <span className="expense-description">{expense.description}</span>
                          <span className="expense-category">{expense.category}</span>
                        </div>
                        <div className="expense-details">
                          <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                          <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="bento-card large budget-progress-card">
                  <h3><MdGpsFixed /> Budget Progress</h3>
                  <div className="budget-list">
                    {budgets.slice(0, 4).map(budget => {
                      const utilization = getBudgetUtilization(budget.category);
                      const isOverBudget = utilization > 100;
                      const isNearLimit = utilization > budget.alertThreshold;
                      
                      return (
                        <div key={budget.id} className="budget-item">
                          <div className="budget-header">
                            <span className="budget-category">{budget.category}</span>
                            <span className="budget-amount">
                              {formatCurrency(budget.currentSpent)} / {formatCurrency(budget.monthlyLimit)}
                            </span>
                          </div>
                          <div className="budget-progress">
                            <div 
                              className={`progress-bar ${isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : ''}`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <div className="budget-status">
                            {isOverBudget && <MdWarning className="warning-icon" />}
                            <span className={`utilization ${isOverBudget ? 'over' : isNearLimit ? 'warning' : ''}`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Savings Goals */}
                <div className="bento-card medium savings-goals-card">
                  <h3><MdSavings /> Savings Goals</h3>
                  <div className="goals-summary">
                    {savingsGoals.slice(0, 2).map(goal => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100;
                      return (
                        <div key={goal.id} className="goal-item">
                          <span className="goal-title">{goal.title}</span>
                          <div className="goal-progress">
                            <div className="goal-progress-bar" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="goal-amount">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bento-card small quick-actions-card">
                  <h3><MdSettings /> Quick Actions</h3>
                  <div className="action-buttons">
                    <button onClick={() => setShowAddBudget(true)}>
                      <MdGpsFixed /> Add Budget
                    </button>
                    <button onClick={() => setShowAddGoal(true)}>
                      <MdSavings /> Add Goal
                    </button>

                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'expenses' && (
            <div className="expenses-view">
              <div className="expenses-controls">
                <div className="search-filter-bar">
                  <div className="search-filter-group">
                    <div className="search-bar">
                      <MdSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className="add-expense-btn"
                    onClick={() => setShowAddExpense(true)}
                  >
                    <MdAdd /> Add Expense
                  </button>
                </div>
              </div>

              <div className="expenses-grid">
                {getFilteredExpenses().map(expense => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-header">
                      <span className="expense-category-badge">{expense.category}</span>
                      <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="expense-content">
                      <h4>{expense.description}</h4>
                      <div className="expense-meta">
                        <span><MdCalendarToday /> {new Date(expense.date).toLocaleDateString()}</span>
                        <span><MdPerson /> {expense.paidBy === 'partner1' ? settings.partner1Name : settings.partner2Name}</span>
                      </div>
                      {expense.tags.length > 0 && (
                        <div className="expense-tags">
                          {expense.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="expense-actions">
                      <button onClick={() => handleEditExpense(expense)} title="Edit expense">
                        <MdEdit />
                      </button>
                      <button onClick={() => confirmDelete(() => deleteExpense(expense.id))} title="Delete expense">
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'budgets' && (
            <div className="budgets-view">
              <div className="budgets-controls">
                <div className="search-filter-bar">
                  <button 
                    className="add-budget-btn"
                    onClick={() => setShowAddBudget(true)}
                  >
                    <MdAdd /> Add Budget
                  </button>
                </div>
              </div>

              <div className="budgets-grid">
                {budgets.map(budget => {
                  const spent = getExpensesByCategory(budget.category).reduce((sum, exp) => sum + exp.amount, 0);
                  const utilization = (spent / budget.monthlyLimit) * 100;
                  const isOverBudget = utilization > 100;
                  const isNearLimit = utilization > budget.alertThreshold;

                  return (
                    <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : ''}`}>
                      <div className="budget-header">
                        <span className="budget-category">{budget.category}</span>
                        <span className={`budget-status ${budget.isActive ? 'active' : 'inactive'}`}>
                          {budget.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="budget-content">
                        <div className="budget-amounts">
                          <div className="spent-amount">
                            <span className="label">Spent</span>
                            <span className="amount">{formatCurrency(spent)}</span>
                          </div>
                          <div className="budget-limit">
                            <span className="label">Budget</span>
                            <span className="amount">{formatCurrency(budget.monthlyLimit)}</span>
                          </div>
                        </div>
                        <div className="budget-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${isOverBudget ? 'over' : isNearLimit ? 'warning' : 'normal'}`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{utilization.toFixed(1)}% used</span>
                        </div>
                        {isOverBudget && (
                          <div className="budget-warning">
                            <MdWarning /> Over budget by {formatCurrency(spent - budget.monthlyLimit)}
                          </div>
                        )}
                      </div>
                      <div className="budget-actions">
                        <button onClick={() => handleEditBudget(budget)} title="Edit budget">
                          <MdEdit />
                        </button>
                        <button onClick={() => confirmDelete(() => deleteBudget(budget.id))} title="Delete budget">
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentView === 'goals' && (
            <div className="goals-view">
              <div className="goals-controls">
                <div className="search-filter-bar">
                  <button 
                    className="add-goal-btn"
                    onClick={() => setShowAddGoal(true)}
                  >
                    <MdAdd /> Add Goal
                  </button>
                </div>
              </div>

              <div className="goals-grid">
                {savingsGoals.map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const isCompleted = progress >= 100;
                  const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                      <div className="goal-header">
                        <h4>{goal.title}</h4>
                        <span className="goal-category">{goal.category}</span>
                      </div>
                      <div className="goal-content">
                        <div className="goal-amounts">
                          <div className="current-amount">
                            <span className="label">Saved</span>
                            <span className="amount">{formatCurrency(goal.currentAmount)}</span>
                          </div>
                          <div className="target-amount">
                            <span className="label">Target</span>
                            <span className="amount">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                        </div>
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${isCompleted ? 'completed' : 'normal'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{progress.toFixed(1)}% complete</span>
                        </div>
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}
                        {daysLeft !== null && (
                          <div className="goal-timeline">
                            <MdCalendarToday />
                            {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
                          </div>
                        )}
                        {isCompleted && (
                          <div className="goal-completed">
                            <MdCheckCircle /> Goal Completed!
                          </div>
                        )}
                      </div>
                      <div className="goal-actions">
                        <button onClick={() => handleEditGoal(goal)} title="Edit goal">
                          <MdEdit />
                        </button>
                        <button onClick={() => confirmDelete(() => deleteSavingsGoal(goal.id))} title="Delete goal">
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {currentView === 'settings' && (
            <div className="settings-view">
              <div className="settings-controls">
                <h3>Budget Settings</h3>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h4><MdPerson /> Partner Information</h4>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Partner 1 Name</label>
                      <input type="text" value={settings.partner1Name} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Partner 2 Name</label>
                      <input type="text" value={settings.partner2Name} readOnly />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4><MdAttachMoney /> Currency & Preferences</h4>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Currency</label>
                      <select 
                        value={settings.currency}
                        onChange={(e) => updateSettings({ currency: e.target.value })}
                      >
                        <option value="PHP">PHP (₱)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4><MdNotifications /> Notifications</h4>
                  <div className="settings-form">
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={settings.alertsEnabled} readOnly />
                        Enable Budget Alerts
                      </label>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={settings.emailNotifications} readOnly />
                        Enable Email Notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4><MdUpload /> Data Management</h4>
                  <div className="settings-actions">
                    <button className="export-btn">
                      <MdFileDownload /> Export All Data
                    </button>
                    <button className="import-btn">
                      <MdUpload /> Import Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddExpense(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Add New Expense</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="What was this expense for?"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Paid By</label>
                    <select
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value as 'partner1' | 'partner2'})}
                    >
                      <option value="partner1">{settings.partner1Name}</option>
                      <option value="partner2">{settings.partner2Name}</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button onClick={handleAddExpense} className="primary">Add Expense</button>
                </div>
              </div>
            </div>
          )}

          {/* Add Budget Modal */}
          {showAddBudget && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddBudget(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Add New Budget</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value as ExpenseCategory})}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Monthly Limit</label>
                    <input
                      type="number"
                      value={newBudget.monthlyLimit}
                      onChange={(e) => setNewBudget({...newBudget, monthlyLimit: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Alert Threshold (%)</label>
                    <input
                      type="number"
                      value={newBudget.alertThreshold}
                      onChange={(e) => setNewBudget({...newBudget, alertThreshold: parseInt(e.target.value)})}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowAddBudget(false)}>Cancel</button>
                  <button onClick={handleAddBudget} className="primary">Add Budget</button>
                </div>
              </div>
            </div>
          )}

          {/* Add Goal Modal */}
          {showAddGoal && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddGoal(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Add Savings Goal</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Goal Title</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="e.g., Vacation to Europe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Amount</label>
                    <input
                      type="number"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
                    >
                      <option value="vacation">Vacation</option>
                      <option value="home">Home</option>
                      <option value="wedding">Wedding</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowAddGoal(false)}>Cancel</button>
                  <button onClick={handleAddGoal} className="primary">Add Goal</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Expense Modal */}
          {showEditExpense && editingExpense && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditExpense(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Expense</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="What was this expense for?"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Paid By</label>
                    <select
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value as 'partner1' | 'partner2'})}
                    >
                      <option value="partner1">{settings.partner1Name}</option>
                      <option value="partner2">{settings.partner2Name}</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowEditExpense(false)}>Cancel</button>
                  <button onClick={handleUpdateExpense} className="primary">Update Expense</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Budget Modal */}
          {showEditBudget && editingBudget && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditBudget(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Budget</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value as ExpenseCategory})}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Monthly Limit</label>
                    <input
                      type="number"
                      value={newBudget.monthlyLimit}
                      onChange={(e) => setNewBudget({...newBudget, monthlyLimit: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Alert Threshold (%)</label>
                    <input
                      type="number"
                      value={newBudget.alertThreshold}
                      onChange={(e) => setNewBudget({...newBudget, alertThreshold: parseInt(e.target.value)})}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={newBudget.isActive}
                        onChange={(e) => setNewBudget({...newBudget, isActive: e.target.checked})}
                      />
                      Active Budget
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowEditBudget(false)}>Cancel</button>
                  <button onClick={handleUpdateBudget} className="primary">Update Budget</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Goal Modal */}
          {showEditGoal && editingGoal && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditGoal(false);
              }
            }}>
              <div className="add-form" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Savings Goal</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Goal Title</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="e.g., Vacation to Europe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Amount</label>
                    <input
                      type="number"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
                    >
                      <option value="vacation">Vacation</option>
                      <option value="home">Home</option>
                      <option value="wedding">Wedding</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <input
                      type="text"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowEditGoal(false)}>Cancel</button>
                  <button onClick={handleUpdateGoal} className="primary">Update Goal</button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Dialog */}
          {showConfirmDialog && (
            <div className="add-form-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowConfirmDialog(false);
              }
            }}>
              <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                  <MdWarning className="warning-icon" />
                  <h3>Confirm Delete</h3>
                </div>
                <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                <div className="confirm-actions">
                  <button onClick={() => setShowConfirmDialog(false)}>Cancel</button>
                  <button onClick={handleConfirmDelete} className="danger">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
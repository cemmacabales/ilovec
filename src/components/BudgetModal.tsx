import { useState } from 'react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdDelete,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdSavings,
  MdReceipt,
  MdSearch,
  MdViewList,
  MdViewModule,
  MdPerson,
  MdCalendarToday,
  MdFlag,
} from 'react-icons/md';
import { useBudget } from '../contexts/BudgetContext';
import type { Expense, ExpenseCategory, Budget, SavingsGoal } from '../types/budget';
interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const [currentView, setCurrentView] = useState<'expenses' | 'budgets' | 'goals'>('expenses');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'partner1' | 'partner2' | ExpenseCategory>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const {
    expenses,
    budgets,
    savingsGoals,
    settings,
    addExpense,
    addBudget,
    addSavingsGoal,
    updateExpense,
    deleteExpense,
    updateBudget,
    deleteBudget,
    updateSavingsGoal,
    deleteSavingsGoal,
    getTotalSpentThisMonth,
    getExpensesByCategory,
    getBudgetUtilization
  } = useBudget();

  const [newItem, setNewItem] = useState<any>({
    // Expense fields
    amount: '',
    category: 'restaurants' as ExpenseCategory,
    description: '',
    date: new Date().toISOString().slice(0, 10),
    paidBy: 'partner1' as 'partner1' | 'partner2',
    // Budget fields
    monthlyLimit: '',
    alertThreshold: 80,
    isActive: true,
    // Goal fields
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    goalCategory: 'vacation' as 'vacation' | 'home' | 'wedding' | 'emergency' | 'other'
  });

  const categories: ExpenseCategory[] = [
    'restaurants', 'entertainment', 'travel', 'gifts', 'activities',
    'groceries', 'transportation', 'utilities', 'subscriptions',
    'healthcare', 'shopping', 'other'
  ];

  const goalCategories = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'home', label: 'Home' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' }
  ];

  const normalizeString = (value: string | null | undefined) => value ? value.toLowerCase() : '';

  const handleAddItem = async () => {
    if (currentView === 'expenses' && newItem.amount && newItem.description) {
      await addExpense({
        amount: parseFloat(newItem.amount),
        category: newItem.category,
        description: newItem.description,
        date: newItem.date,
        paidBy: newItem.paidBy,
        splitType: 'equal',
        splitPercentage: 50,
        tags: [],
        isRecurring: false
      });
    } else if (currentView === 'budgets' && newItem.monthlyLimit) {
      addBudget({
        category: newItem.category,
        monthlyLimit: parseFloat(newItem.monthlyLimit),
        alertThreshold: newItem.alertThreshold,
        isActive: newItem.isActive
      });
    } else if (currentView === 'goals' && newItem.title && newItem.targetAmount) {
      addSavingsGoal({
        title: newItem.title,
        targetAmount: parseFloat(newItem.targetAmount),
        currentAmount: parseFloat(newItem.currentAmount) || 0,
        targetDate: newItem.targetDate,
        category: newItem.goalCategory,
        description: newItem.description || ''
      });
    }
    
    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setNewItem({
      amount: '',
      category: 'restaurants',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      paidBy: 'partner1',
      monthlyLimit: '',
      alertThreshold: 80,
      isActive: true,
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      goalCategory: 'vacation'
    });
  };

  const handleEditItem = (item: any) => {
    if (currentView === 'expenses') {
      setEditingExpense(item);
      setNewItem({
        ...newItem,
        amount: item.amount.toString(),
        category: item.category,
        description: item.description,
        date: item.date,
        paidBy: item.paidBy
      });
    } else if (currentView === 'budgets') {
      setEditingBudget(item);
      setNewItem({
        ...newItem,
        category: item.category,
        monthlyLimit: item.monthlyLimit.toString(),
        alertThreshold: item.alertThreshold,
        isActive: item.isActive
      });
    } else if (currentView === 'goals') {
      setEditingGoal(item);
      setNewItem({
        ...newItem,
        title: item.title,
        targetAmount: item.targetAmount.toString(),
        currentAmount: item.currentAmount.toString(),
        targetDate: item.targetDate,
        goalCategory: item.category,
        description: item.description || ''
      });
    }
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (currentView === 'expenses' && editingExpense && newItem.amount && newItem.description) {
      updateExpense(editingExpense.id, {
        amount: parseFloat(newItem.amount),
        category: newItem.category,
        description: newItem.description,
        date: newItem.date,
        paidBy: newItem.paidBy,
        splitType: 'equal',
        splitPercentage: 50,
        tags: [],
        isRecurring: false
      });
      setEditingExpense(null);
    } else if (currentView === 'budgets' && editingBudget && newItem.monthlyLimit) {
      updateBudget(editingBudget.id, {
        category: newItem.category,
        monthlyLimit: parseFloat(newItem.monthlyLimit),
        alertThreshold: newItem.alertThreshold,
        isActive: newItem.isActive
      });
      setEditingBudget(null);
    } else if (currentView === 'goals' && editingGoal && newItem.title && newItem.targetAmount) {
      updateSavingsGoal(editingGoal.id, {
        title: newItem.title,
        targetAmount: parseFloat(newItem.targetAmount),
        currentAmount: parseFloat(newItem.currentAmount) || 0,
        targetDate: newItem.targetDate,
        category: newItem.goalCategory,
        description: newItem.description
      });
      setEditingGoal(null);
    }
    
    resetForm();
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    if (currentView === 'expenses') {
      deleteExpense(id);
    } else if (currentView === 'budgets') {
      deleteBudget(id);
    } else if (currentView === 'goals') {
      deleteSavingsGoal(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'PHP'
    }).format(amount);
  };

const formatDate = (dateStr: string) => {
  // Only format if dateStr matches YYYY-MM-DD and is a valid date
  if (
    typeof dateStr === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
    !isNaN(new Date(dateStr).getTime())
  ) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return '-';
};

  const getFilteredItems = () => {
    const normalizedSearch = normalizeString(searchTerm);
    const normalizedFilter = normalizeString(filterBy);
    let filtered: any[] = [];

    if (currentView === 'expenses') {
      filtered = expenses.filter((expense) => {
        const description = normalizeString(expense?.description);
        const category = normalizeString(expense?.category);
        const matchesSearch =
          !normalizedSearch || description.includes(normalizedSearch) || category.includes(normalizedSearch);

        let matchesFilter = true;

        if (filterBy === 'partner1' || filterBy === 'partner2') {
          matchesFilter = expense.paidBy === filterBy;
        } else if (filterBy !== 'all') {
          matchesFilter = category === normalizedFilter;
        }

        return matchesSearch && matchesFilter;
      });
    } else if (currentView === 'budgets') {
      filtered = budgets.filter((budget) => {
        const category = normalizeString(budget?.category);
        return !normalizedSearch || category.includes(normalizedSearch);
      });
    } else if (currentView === 'goals') {
      filtered = savingsGoals.filter((goal) => {
        const title = normalizeString(goal?.title);
        const category = normalizeString(goal?.category);
        return (
          !normalizedSearch ||
          title.includes(normalizedSearch) ||
          category.includes(normalizedSearch)
        );
      });
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          if (currentView === 'expenses') return (b.amount || 0) - (a.amount || 0);
          if (currentView === 'budgets') return (b.monthlyLimit || 0) - (a.monthlyLimit || 0);
          if (currentView === 'goals') return (b.targetAmount || 0) - (a.targetAmount || 0);
          return 0;
        case 'category': {
          const valueA = normalizeString((a.category ?? a.title ?? '') as string);
          const valueB = normalizeString((b.category ?? b.title ?? '') as string);
          return valueA.localeCompare(valueB);
        }
        case 'date':
        default:
          if (currentView === 'expenses') {
            return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
          }
          if (
            currentView === 'goals' &&
            'targetDate' in a &&
            'targetDate' in b &&
            a.targetDate &&
            b.targetDate
          ) {
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
          }
          return 0;
      }
    });
  };

  const getStats = () => {
    const totalSpent = getTotalSpentThisMonth();
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
    const activeGoals = savingsGoals.filter(goal => goal.currentAmount < goal.targetAmount).length;
    const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    
    return {
      totalSpent,
      totalBudget,
      budgetUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      transactionCount: expenses.length,
      activeGoals,
      completedGoals,
      overBudgetCount: budgets.filter(b => getBudgetUtilization(b.category) > 100).length
    };
  };

  const stats = getStats();
  const filteredItems = getFilteredItems();

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2><MdAccountBalanceWallet /> Budget Tracker</h2>
            <div className="budget-stats">
              <span className="stat-item">
                <MdReceipt /> {stats.transactionCount} transactions
              </span>
              <span className="stat-item spent">
                <MdTrendingDown /> {formatCurrency(stats.totalSpent)} spent
              </span>
              <span className="stat-item budget">
                <MdTrendingUp /> {formatCurrency(stats.totalBudget)} budget
              </span>
              {stats.overBudgetCount > 0 && (
                <span className="stat-item overdue">
                  <MdFlag /> {stats.overBudgetCount} over budget
                </span>
              )}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="modal-body">
          {/* Controls */}
          <div className="budget-controls">
            <div className="search-filter-row">
              <div className="view-tabs">
                <button 
                  className={`view-tab ${currentView === 'expenses' ? 'active' : ''}`}
                  onClick={() => setCurrentView('expenses')}
                >
                  <MdReceipt /> Expenses
                </button>
                <button 
                  className={`view-tab ${currentView === 'budgets' ? 'active' : ''}`}
                  onClick={() => setCurrentView('budgets')}
                >
                  <MdTrendingUp /> Budgets
                </button>
                <button 
                  className={`view-tab ${currentView === 'goals' ? 'active' : ''}`}
                  onClick={() => setCurrentView('goals')}
                >
                  <MdSavings /> Goals
                </button>
              </div>

              <div className="search-bar">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${currentView}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-controls">
                {currentView === 'expenses' && (
                  <>
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as any)}>
                      <option value="all">All Items</option>
                      <option value="partner1">{settings.partner1Name}</option>
                      <option value="partner2">{settings.partner2Name}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </>
                )}
                
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
              </div>

              <div className="view-actions">
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <MdViewList />
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <MdViewModule />
                  </button>
                </div>
                
                <button 
                  className="add-task-btn"
                  onClick={() => setShowAddForm(true)}
                >
                  <MdAdd /> Add {currentView === 'expenses' ? 'Expense' : currentView === 'budgets' ? 'Budget' : 'Goal'}
                </button>
              </div>
            </div>
          </div>

          {/* Items Container */}
          <div className={`budget-container ${viewMode}`}>
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <MdAccountBalanceWallet className="empty-icon" />
                <h3>No {currentView} found</h3>
                <p>
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : `Add your first ${currentView.slice(0, -1)} to get started!`
                  }
                </p>
                {!searchTerm && filterBy === 'all' && (
                  <button 
                    className="add-first-task-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    <MdAdd /> Add First {currentView === 'expenses' ? 'Expense' : currentView === 'budgets' ? 'Budget' : 'Goal'}
                  </button>
                )}
              </div>
            ) : (
              <div className="budget-grid">
                {filteredItems.map((item) => (
                  <div key={item.id} className="budget-card">
                    {currentView === 'expenses' && (
                      <>
                        <div className="budget-header">
                          <span className="budget-category">{item.category}</span>
                          <span className="budget-amount">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="budget-content">
                          <h3 className="budget-title">{item.description}</h3>
                          <div className="budget-details">
                            <div className="budget-meta">
                              <MdCalendarToday />
                              <span>{formatDate(item.date)}</span>
                            </div>
                            <div className="budget-meta">
                              <MdPerson />
                              <span>{item.paidBy === 'partner1' ? settings.partner1Name : settings.partner2Name}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentView === 'budgets' && (
                      <>
                        <div className="budget-header">
                          <span className="budget-category">{item.category}</span>
                          <span className={`budget-status ${item.isActive ? 'active' : 'inactive'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="budget-content">
                          <h3 className="budget-title">Monthly Budget</h3>
                          <div className="budget-amounts">
                            <div className="budget-amount-item">
                              <span className="label">Limit</span>
                              <span className="amount">{formatCurrency(item.monthlyLimit)}</span>
                            </div>
                            <div className="budget-amount-item">
                              <span className="label">Spent</span>
                              <span className="amount">
                                {formatCurrency(getExpensesByCategory(item.category).reduce((sum, exp) => sum + exp.amount, 0))}
                              </span>
                            </div>
                          </div>
                          <div className="budget-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${Math.min(item.monthlyLimit > 0 ? (getExpensesByCategory(item.category).reduce((sum, exp) => sum + exp.amount, 0) / item.monthlyLimit) * 100 : 0, 100)}%` }}
                              />
                            </div>
                            <span className="progress-text">
                              {item.monthlyLimit > 0 ? ((getExpensesByCategory(item.category).reduce((sum, exp) => sum + exp.amount, 0) / item.monthlyLimit) * 100).toFixed(1) : '0.0'}% used
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {currentView === 'goals' && (
                      <>
                        <div className="budget-header">
                          <span className="budget-category">{item.category}</span>
                          <span className="budget-amount">{formatCurrency(item.targetAmount)}</span>
                        </div>
                        <div className="budget-content">
                          <h3 className="budget-title">{item.title}</h3>
                          <div className="budget-amounts">
                            <div className="budget-amount-item">
                              <span className="label">Saved</span>
                              <span className="amount">{formatCurrency(item.currentAmount)}</span>
                            </div>
                            <div className="budget-amount-item">
                              <span className="label">Target</span>
                              <span className="amount">{formatCurrency(item.targetAmount)}</span>
                            </div>
                          </div>
                          <div className="budget-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${Math.min((item.currentAmount / item.targetAmount) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="progress-text">{((item.currentAmount / item.targetAmount) * 100).toFixed(1)}% complete</span>
                          </div>
                          {item.targetDate && (
                            <div className="budget-meta">
                              <MdCalendarToday />
                              <span>Due {formatDate(item.targetDate)}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="budget-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditItem(item)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="form-overlay" onClick={() => setShowAddForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>
                  {editingExpense || editingBudget || editingGoal ? 'Edit' : 'Add'} {' '}
                  {currentView === 'expenses' ? 'Expense' : currentView === 'budgets' ? 'Budget' : 'Goal'}
                </h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>
                  <MdClose />
                </button>
              </div>
              
              <div className="form-content">
                {currentView === 'expenses' && (
                  <>
                    <div className="form-group">
                      <label>Amount *</label>
                      <input
                        type="number"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="What was this expense for?"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={newItem.date}
                          onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Paid By</label>
                      <select
                        value={newItem.paidBy}
                        onChange={(e) => setNewItem({ ...newItem, paidBy: e.target.value })}
                      >
                        <option value="partner1">{settings.partner1Name}</option>
                        <option value="partner2">{settings.partner2Name}</option>
                      </select>
                    </div>
                  </>
                )}

                {currentView === 'budgets' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Monthly Limit *</label>
                        <input
                          type="number"
                          value={newItem.monthlyLimit}
                          onChange={(e) => setNewItem({ ...newItem, monthlyLimit: e.target.value })}
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Alert Threshold (%)</label>
                      <input
                        type="number"
                        value={newItem.alertThreshold}
                        onChange={(e) => setNewItem({ ...newItem, alertThreshold: parseInt(e.target.value) })}
                        min="0"
                        max="100"
                      />
                    </div>
                  </>
                )}

                {currentView === 'goals' && (
                  <>
                    <div className="form-group">
                      <label>Goal Title *</label>
                      <input
                        type="text"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="e.g., Vacation to Europe"
                        autoFocus
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Target Amount *</label>
                        <input
                          type="number"
                          value={newItem.targetAmount}
                          onChange={(e) => setNewItem({ ...newItem, targetAmount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Current Amount</label>
                        <input
                          type="number"
                          value={newItem.currentAmount}
                          onChange={(e) => setNewItem({ ...newItem, currentAmount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={newItem.goalCategory}
                          onChange={(e) => setNewItem({ ...newItem, goalCategory: e.target.value })}
                        >
                          {goalCategories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Target Date</label>
                        <input
                          type="date"
                          value={newItem.targetDate}
                          onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={newItem.description || ''}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Add more details..."
                        rows={3}
                      />
                    </div>
                  </>
                )}
                
                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-btn"
                    onClick={editingExpense || editingBudget || editingGoal ? handleUpdateItem : handleAddItem}
                    disabled={
                      (currentView === 'expenses' && (!newItem.amount?.trim() || !newItem.description?.trim())) ||
                      (currentView === 'budgets' && !newItem.monthlyLimit?.trim()) ||
                      (currentView === 'goals' && (!newItem.title?.trim() || !newItem.targetAmount?.trim() || !newItem.targetDate?.trim()))
                    }
                  >
                    {editingExpense || editingBudget || editingGoal ? 'Save Changes' : `Add ${currentView === 'expenses' ? 'Expense' : currentView === 'budgets' ? 'Budget' : 'Goal'}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdSort,
  MdViewList,
  MdViewModule,
  MdCalendarToday,
  MdAttachMoney,
  MdAccessTime,
  MdLocalFireDepartment,
  MdTrendingUp,
  MdEmojiEvents,
  MdRocket,
  MdStar,
  MdGpsFixed,
  MdDiamond,
  MdFormatQuote,
  MdFlightTakeoff,
  MdTerrain,
  MdSchool,
  MdWork,
  MdFitnessCenter,
  MdFavorite,
  MdPalette,
  MdAutoAwesome,
  MdPerson,
  MdAccountBalance,
  MdSelfImprovement,
  MdDescription,
  MdAssessment,
  MdCheckCircle,
  MdBarChart,
  MdTimeline,
  MdFlashOn,
  MdList,
  MdWarning,
  MdSettings,
  MdFavoriteBorder
} from 'react-icons/md';
import { useBucketList } from '../contexts/BucketListContext';
import type {
  BucketListItem,
  BucketListCategory,
  Priority,
  ItemStatus,
  Difficulty,
  ViewMode,
  SortOption
} from '../types/bucketlist';

interface BucketListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BucketListModal({ isOpen, onClose }: BucketListModalProps) {
  const {
    items,
    filteredItems,
    filters,
    settings,
    stats,
    setFilters,
    clearFilters,
    setSortBy,
    updateSettings,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    updateProgress,
    getInsights,
    getRecommendations
  } = useBucketList();

  const [activeTab, setActiveTab] = useState<'items' | 'analytics' | 'settings'>('items');
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'timeline' | 'motivation'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BucketListCategory | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(settings.viewMode);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Apply filters locally without using setFilters to avoid infinite loops
  const localFilteredItems = useMemo(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter((item: BucketListItem) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item: BucketListItem) => item.category === selectedCategory);
    }

    if (selectedPriority) {
      filtered = filtered.filter((item: BucketListItem) => item.priority === selectedPriority);
    }

    if (selectedStatus) {
      filtered = filtered.filter((item: BucketListItem) => item.status === selectedStatus);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((item: BucketListItem) => item.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [items, searchTerm, selectedCategory, selectedPriority, selectedStatus, selectedDifficulty]);

  const insights = useMemo(() => getInsights(), [getInsights]);
  const recommendations = useMemo(() => getRecommendations(), [getRecommendations]);

  const categories: BucketListCategory[] = [
    'travel', 'adventure', 'learning', 'career', 'health', 'relationships',
    'creativity', 'experiences', 'personal', 'financial', 'spiritual', 'other'
  ];

  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: ItemStatus[] = ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPriority('');
    setSelectedStatus('');
    setSelectedDifficulty('');
    clearFilters();
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateSettings({ viewMode: mode });
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === localFilteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(localFilteredItems.map(item => item.id)));
    }
  };

  const getCategoryIcon = (category: BucketListCategory) => {
    const icons = {
      travel: <MdFlightTakeoff />,
      adventure: <MdTerrain />,
      learning: <MdSchool />,
      career: <MdWork />,
      health: <MdFitnessCenter />,
      relationships: <MdFavorite />,
      creativity: <MdPalette />,
      experiences: <MdAutoAwesome />,
      personal: <MdPerson />,
      financial: <MdAccountBalance />,
      spiritual: <MdSelfImprovement />,
      other: <MdDescription />
    };
    return icons[category];
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority];
  };

  const getStatusColor = (status: ItemStatus): string => {
    const colors = {
      not_started: '#6b7280',
      in_progress: '#3b82f6',
      completed: '#10b981',
      on_hold: '#f59e0b',
      cancelled: '#ef4444'
    };
    return colors[status];
  };

  const getDifficultyStars = (difficulty: Difficulty) => {
    const starCount = {
      easy: 1,
      medium: 2,
      hard: 3,
      extreme: 4
    };
    const count = starCount[difficulty] || 0;
    return Array.from({ length: count }, (_, i) => (
      <MdStar key={i} className="text-yellow-400" />
    ));
  };

  const getCategoryColor = (category: BucketListCategory): string => {
    const colors = {
      travel: '#3b82f6',
      adventure: '#ef4444',
      learning: '#10b981',
      career: '#8b5cf6',
      health: '#f59e0b',
      relationships: '#ec4899',
      creativity: '#06b6d4',
      experiences: '#84cc16',
      personal: '#6366f1',
      financial: '#059669',
      spiritual: '#7c3aed',
      other: '#6b7280'
    };
    return colors[category];
  };

  const renderTimelineView = () => {
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

    const groupedByMonth = sortedItems.reduce((acc, item) => {
      const date = item.targetDate ? new Date(item.targetDate) : new Date(item.createdDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {} as Record<string, BucketListItem[]>);

    return (
      <div className="timeline-view">
        <div className="timeline-header">
          <h3>Timeline View</h3>
          <div className="timeline-legend">
            <div className="legend-item">
              <div className="legend-dot completed"></div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot in-progress"></div>
              <span>In Progress</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot not-started"></div>
              <span>Not Started</span>
            </div>
          </div>
        </div>
        
        <div className="timeline-container">
          {Object.entries(groupedByMonth).map(([monthKey, items]) => {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            });
            
            return (
              <div key={monthKey} className="timeline-month">
                <div className="timeline-month-header">
                  <h4>{monthName}</h4>
                  <span className="timeline-month-count">{items.length} items</span>
                </div>
                
                <div className="timeline-items">
                  {items.map((item, index) => (
                    <div key={item.id} className={`timeline-item ${item.status}`}>
                      <div className="timeline-item-marker">
                        <div className={`timeline-dot ${item.status}`}></div>
                        {index < items.length - 1 && <div className="timeline-line"></div>}
                      </div>
                      
                      <div className="timeline-item-content">
                        <div className="timeline-item-header">
                          <h5>{item.title}</h5>
                          <div className="timeline-item-meta">
                            <span className={`category-badge ${item.category}`}>
                              {item.category}
                            </span>
                            <span className={`priority-badge ${item.priority}`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="timeline-item-description">{item.description}</p>
                        )}
                        
                        <div className="timeline-item-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{item.progress}%</span>
                        </div>
                        
                        {item.targetDate && (
                          <div className="timeline-item-date">
                            <MdCalendarToday />
                            Target: {new Date(item.targetDate).toLocaleDateString()}
                          </div>
                        )}
                        
                        {item.estimatedCost && (
                          <div className="timeline-item-cost">
                            <MdAttachMoney />
                            {formatCurrency(item.estimatedCost)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {Object.keys(groupedByMonth).length === 0 && (
            <div className="timeline-empty">
              <MdAccessTime />
              <h4>No items to display</h4>
              <p>Add some bucket list items to see your timeline</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMotivationView = () => {
    const completedItems = filteredItems.filter(item => item.status === 'completed');
    const inProgressItems = filteredItems.filter(item => item.status === 'in_progress');
    const totalProgress = filteredItems.reduce((sum, item) => sum + item.progress, 0) / filteredItems.length || 0;
    
    // Calculate streaks and achievements
    const currentStreak = 7; // This would be calculated based on recent completions
    const longestStreak = 14; // This would be stored in user data
    const totalAchievements = completedItems.length;
    
    // Motivational insights
    const motivationalInsights = [
      {
        type: 'streak',
        title: 'Keep the momentum!',
        description: `You're on a ${currentStreak}-day streak. Complete one more item to beat your record!`,
        icon: 'fire',
        color: '#ef4444'
      },
      {
        type: 'progress',
        title: 'Great progress!',
        description: `You've completed ${Math.round(totalProgress)}% of your active goals on average.`,
        icon: 'trending',
        color: '#10b981'
      },
      {
        type: 'achievement',
        title: 'Achievement unlocked!',
        description: `You've completed ${totalAchievements} bucket list items. Amazing!`,
        icon: 'trophy',
        color: '#f59e0b'
      }
    ];

    const getMotivationIcon = (iconType: string) => {
      switch (iconType) {
        case 'fire': return <MdLocalFireDepartment />;
        case 'trending': return <MdTrendingUp />;
        case 'trophy': return <MdEmojiEvents />;
        default: return <MdStar />;
      }
    };

    return (
      <div className="motivation-view">
        <div className="motivation-header">
          <h3>Motivation & Progress</h3>
          <div className="motivation-score">
            <div className="score-circle">
              <div className="score-value">{Math.round(totalProgress)}</div>
              <div className="score-label">Avg Progress</div>
            </div>
          </div>
        </div>

        <div className="motivation-stats">
          <div className="motivation-stat-card streak">
            <div className="stat-icon">
              <MdLocalFireDepartment />
            </div>
            <div className="stat-content">
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-label">Day Streak</div>
              <div className="stat-sublabel">Longest: {longestStreak} days</div>
            </div>
          </div>

          <div className="motivation-stat-card achievements">
            <div className="stat-icon">
              <MdEmojiEvents />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalAchievements}</div>
              <div className="stat-label">Completed</div>
              <div className="stat-sublabel">This year</div>
            </div>
          </div>

          <div className="motivation-stat-card momentum">
            <div className="stat-icon">
              <MdRocket />
            </div>
            <div className="stat-content">
              <div className="stat-value">{inProgressItems.length}</div>
              <div className="stat-label">In Progress</div>
              <div className="stat-sublabel">Keep going!</div>
            </div>
          </div>
        </div>

        <div className="motivation-insights">
          <h4>Motivational Insights</h4>
          <div className="insights-grid">
            {motivationalInsights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon" style={{ color: insight.color }}>
                  {getMotivationIcon(insight.icon)}
                </div>
                <div className="insight-content">
                  <h5>{insight.title}</h5>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="motivation-challenges">
          <h4>Weekly Challenges</h4>
          <div className="challenges-list">
            <div className="challenge-item active">
              <div className="challenge-icon">
                <MdGpsFixed />
              </div>
              <div className="challenge-content">
                <h5>Complete 3 items this week</h5>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '66%' }}></div>
                  </div>
                  <span>2/3 completed</span>
                </div>
              </div>
              <div className="challenge-reward">
                <MdDiamond />
                <span>50 XP</span>
              </div>
            </div>

            <div className="challenge-item">
              <div className="challenge-icon">
                <MdAccessTime />
              </div>
              <div className="challenge-content">
                <h5>Update progress daily</h5>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <span>6/7 days</span>
                </div>
              </div>
              <div className="challenge-reward">
                <MdStar />
                <span>25 XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="motivation-quotes">
          <div className="quote-card">
            <div className="quote-icon">
              <MdFormatQuote />
            </div>
            <blockquote>
              "The way to get started is to quit talking and begin doing."
            </blockquote>
            <cite>- Walt Disney</cite>
          </div>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const renderItemCard = (item: BucketListItem) => (
    <div key={item.id} className="bucket-item-card">
      <div className="bucket-item-header">
        <div className="bucket-item-select">
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={(e) => handleItemSelect(item.id, e.target.checked)}
          />
        </div>
        <div className="bucket-item-category">
          <span className="category-icon">{getCategoryIcon(item.category)}</span>
          <span className="category-name">{item.category}</span>
        </div>
        <div className="bucket-item-actions">
          {item.achievements.length > 0 && (
            <div className="achievement-badges">
              {item.achievements.slice(0, 2).map(achievement => (
                <span 
                  key={achievement.id} 
                  className="achievement-badge"
                  title={achievement.description}
                >
                  {achievement.icon}
                </span>
              ))}
              {item.achievements.length > 2 && (
                <span className="achievement-count">+{item.achievements.length - 2}</span>
              )}
            </div>
          )}
          <button
            className={`favorite-btn ${item.isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(item.id)}
          >
            {item.isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
          </button>
          <button
            className="edit-btn"
            onClick={() => setEditingItem(item)}
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

      <div className="bucket-item-content">
        <div className="bucket-item-title-row">
          <h3 className="bucket-item-title">{item.title}</h3>
          {item.targetDate && (
            <div className="deadline-indicator">
              {(() => {
                const today = new Date();
                const target = new Date(item.targetDate);
                const daysUntil = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysUntil < 0) {
                  return <span className="deadline overdue"><MdWarning /> Overdue</span>;
                } else if (daysUntil <= 7) {
                  return <span className="deadline urgent"><MdLocalFireDepartment /> {daysUntil}d left</span>;
                } else if (daysUntil <= 30) {
                  return <span className="deadline soon"><MdAccessTime /> {daysUntil}d left</span>;
                }
                return null;
              })()}
            </div>
          )}
        </div>
        {item.description && (
          <p className="bucket-item-description">{item.description}</p>
        )}

        <div className="bucket-item-meta">
          <div className="meta-row">
            <span className="meta-label">Priority:</span>
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(item.priority) }}
            >
              {item.priority}
            </span>
          </div>
          
          <div className="meta-row">
            <span className="meta-label">Status:</span>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(item.status) }}
            >
              {item.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="meta-row">
            <span className="meta-label">Difficulty:</span>
            <span className="difficulty-stars">{getDifficultyStars(item.difficulty)}</span>
          </div>

          {item.estimatedCost && (
            <div className="meta-row">
              <span className="meta-label">Cost:</span>
              <span className="cost-amount">
                {formatCurrency(item.estimatedCost, item.currency)}
              </span>
            </div>
          )}

          {item.targetDate && (
            <div className="meta-row">
              <span className="meta-label">Target:</span>
              <span className="target-date">{formatDate(item.targetDate)}</span>
            </div>
          )}
        </div>

        <div className="bucket-item-progress">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className={`progress-percentage ${item.progress === 100 ? 'completed' : item.progress >= 75 ? 'high' : item.progress >= 50 ? 'medium' : 'low'}`}>
              {item.progress}%
            </span>
            {item.progress === 100 && <span className="completion-badge">🎉</span>}
          </div>
          <div className="progress-bar">
            <div 
              className={`progress-fill ${item.progress === 100 ? 'completed' : item.progress >= 75 ? 'high' : item.progress >= 50 ? 'medium' : 'low'}`}
              style={{ width: `${item.progress}%` }}
            />
            {item.milestones.map(milestone => (
              <div
                key={milestone.id}
                className={`milestone-marker ${milestone.isCompleted ? 'completed' : ''}`}
                style={{ left: `${milestone.progress}%` }}
                title={milestone.title}
              >
                {milestone.isCompleted ? '✓' : '○'}
              </div>
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={item.progress}
            onChange={(e) => updateProgress(item.id, parseInt(e.target.value))}
            className="progress-slider"
          />
        </div>

        {item.subGoals.length > 0 && (
          <div className="bucket-item-subgoals">
            <h4>Sub-goals ({item.subGoals.filter(sg => sg.isCompleted).length}/{item.subGoals.length})</h4>
            <div className="subgoals-list">
              {item.subGoals.slice(0, 3).map(subGoal => (
                <div key={subGoal.id} className={`subgoal ${subGoal.isCompleted ? 'completed' : ''}`}>
                  <span className="subgoal-title">{subGoal.title}</span>
                  {subGoal.isCompleted && <span className="checkmark">✓</span>}
                </div>
              ))}
              {item.subGoals.length > 3 && (
                <div className="subgoals-more">+{item.subGoals.length - 3} more</div>
              )}
            </div>
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="bucket-item-tags">
            {item.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderItemsList = () => (
    <div className={`bucket-items-container ${viewMode}`}>
      <div className="items-header">
        <div className="items-count">
          {localFilteredItems.length} of {stats.totalItems} items
        </div>
        <div className="view-controls">
          <div className="view-mode-selector">
            {(['grid', 'list', 'timeline', 'kanban'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                className={`view-mode-btn ${settings.viewMode === mode ? 'active' : ''}`}
                onClick={() => updateSettings({ viewMode: mode })}
              >
                {mode === 'grid' && <MdViewModule />}
                {mode === 'list' && <MdViewList />}
                {mode === 'timeline' && <MdTimeline />}
                {mode === 'kanban' && <MdAssessment />}
              </button>
            ))}
          </div>
          <div className="sort-controls">
            <select
              value={settings.sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="created_date">Created Date</option>
              <option value="updated_date">Updated Date</option>
              <option value="target_date">Target Date</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="difficulty">Difficulty</option>
              <option value="cost">Cost</option>
            </select>
            <button
              className={`sort-order-btn ${settings.sortOrder}`}
              onClick={() => setSortBy(settings.sortBy, settings.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {settings.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {selectedItems.size > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedItems.size} selected</span>
          <button onClick={() => setSelectedItems(new Set())}>Clear</button>
          <button onClick={toggleSelectAll}>
            {selectedItems.size === localFilteredItems.length ? 'Deselect All' : 'Select All'}
          </button>
          <button>Archive Selected</button>
          <button>Delete Selected</button>
        </div>
      )}

      <div className="items-grid">
        {localFilteredItems.map(renderItemCard)}
      </div>

      {localFilteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><MdGpsFixed /></div>
          <h3>No items found</h3>
          <p>Try adjusting your filters or add your first bucket list item!</p>
          <button 
            className="add-first-item-btn"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-container">
      <div className="analytics-tabs">
        <button 
          className={`analytics-tab ${analyticsView === 'overview' ? 'active' : ''}`}
          onClick={() => setAnalyticsView('overview')}
        >
          <MdAssessment /> Overview
        </button>
        <button 
          className={`analytics-tab ${analyticsView === 'timeline' ? 'active' : ''}`}
          onClick={() => setAnalyticsView('timeline')}
        >
          <MdTimeline /> Timeline
        </button>
        <button 
          className={`analytics-tab ${analyticsView === 'motivation' ? 'active' : ''}`}
          onClick={() => setAnalyticsView('motivation')}
        >
          <MdGpsFixed /> Motivation
        </button>
      </div>

      {analyticsView === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><MdBarChart /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalItems}</div>
                <div className="stat-label">Total Items</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><MdCheckCircle /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.completedItems}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><MdRocket /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.inProgressItems}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><MdAttachMoney /></div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(stats.totalEstimatedCost)}</div>
                <div className="stat-label">Total Cost</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><MdTrendingUp /></div>
              <div className="stat-content">
                <div className="stat-value">{Math.round(stats.completionRate)}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><MdFlashOn /></div>
              <div className="stat-content">
                <div className="stat-value">{Math.round(stats.averageProgress)}%</div>
                <div className="stat-label">Avg Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><MdLocalFireDepartment /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.streakDays}</div>
                <div className="stat-label">Current Streak</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><MdEmojiEvents /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Category Breakdown</h3>
              <div className="category-chart">
                {Object.entries(stats.categoriesCount).map(([category, count]) => (
                  <div key={category} className="category-bar">
                    <div className="category-info">
                      <span className="category-icon">{getCategoryIcon(category as BucketListCategory)}</span>
                      <span className="category-name">{category}</span>
                      <span className="category-count">({count})</span>
                    </div>
                    <div className="category-progress">
                      <div 
                        className="category-fill"
                        style={{ 
                          width: `${(count / stats.totalItems) * 100}%`,
                          backgroundColor: getCategoryColor(category as BucketListCategory)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Priority Distribution</h3>
              <div className="priority-chart">
                {Object.entries(stats.prioritiesCount).map(([priority, count]) => (
                  <div key={priority} className="priority-item">
                    <div 
                      className="priority-circle"
                      style={{ backgroundColor: getPriorityColor(priority as Priority) }}
                    >
                      {count}
                    </div>
                    <span className="priority-label">{priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {analyticsView === 'timeline' && renderTimelineView()}
      {analyticsView === 'motivation' && renderMotivationView()}

      <div className="insights-section">
        <h3>Insights & Recommendations</h3>
        <div className="recommendations-list">
          {recommendations.map(rec => (
            <div key={rec.id} className={`recommendation ${rec.priority}`}>
              <div className="rec-content">
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
              </div>
              <button className="rec-action">{rec.actionText}</button>
            </div>
          ))}
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <h4>Upcoming Deadlines</h4>
            <div className="insight-list">
              {insights.upcomingDeadlines.slice(0, 5).map(item => (
                <div key={item.id} className="insight-item">
                  <span className="item-title">{item.title}</span>
                  <span className="item-date">{item.targetDate && formatDate(item.targetDate)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-card">
            <h4>Quick Wins</h4>
            <div className="insight-list">
              {insights.quickWins.slice(0, 5).map(item => (
                <div key={item.id} className="insight-item">
                  <span className="item-title">{item.title}</span>
                  <span className="item-difficulty">{getDifficultyStars(item.difficulty)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="bucket-modal-overlay" onClick={onClose}>
      <div className="bucket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bucket-modal-header">
          <h2><MdGpsFixed /> Bucket List</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="bucket-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <MdList /> Items ({stats.totalItems})
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <MdAssessment /> Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {activeTab === 'items' && (
          <>
            <div className="bucket-controls">
              <div className="search-controls">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search bucket list items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button className="search-btn">🔍</button>
                </div>
              </div>

              <div className="filter-controls">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as BucketListCategory)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                >
                  <option value="">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ItemStatus)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {getDifficultyStars(difficulty)} {difficulty}
                    </option>
                  ))}
                </select>

                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>

              <div className="action-controls">
                <button 
                  className="add-item-btn primary"
                  onClick={() => setShowAddForm(true)}
                >
                  <MdAdd /> Add Item
                </button>
              </div>
            </div>

            {renderItemsList()}
          </>
        )}

        {activeTab === 'analytics' && renderAnalytics()}

        {activeTab === 'settings' && (
          <div className="settings-container">
            <h3>Settings</h3>
            <p>Settings panel would go here with preferences for currency, reminders, etc.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingItem ? 'Edit Bucket List Item' : 'Add New Bucket List Item'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormErrors({});
                }}
              >
                <MdClose />
              </button>
            </div>
            
            <form className="bucket-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              // Validate required fields
              const errors: {[key: string]: string} = {};
              const title = formData.get('title') as string;
              const description = formData.get('description') as string;
              const category = formData.get('category') as string;
              const priority = formData.get('priority') as string;
              const status = formData.get('status') as string;
              const difficulty = formData.get('difficulty') as string;
              
              if (!title?.trim()) {
                errors.title = 'Title is required';
              }
              if (!description?.trim()) {
                errors.description = 'Description is required';
              }
              if (!category) {
                errors.category = 'Category is required';
              }
              if (!priority) {
                errors.priority = 'Priority is required';
              }
              if (!status) {
                errors.status = 'Status is required';
              }
              if (!difficulty) {
                errors.difficulty = 'Difficulty is required';
              }
              
              if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
              }
              
              // Clear errors if validation passes
              setFormErrors({});
              
              if (editingItem) {
                // For editing, update the existing item
                const updates: Partial<BucketListItem> = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as BucketListCategory,
                  priority: formData.get('priority') as Priority,
                  status: formData.get('status') as ItemStatus,
                  difficulty: formData.get('difficulty') as Difficulty,
                  estimatedCost: formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : undefined,
                  currency: 'USD',
                  targetDate: formData.get('targetDate') ? new Date(formData.get('targetDate') as string) : undefined,
                  tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
                  location: formData.get('location') as string || undefined,
                  notes: formData.get('notes') as string || undefined,
                };
                updateItem(editingItem.id, updates);
              } else {
                // For new items, create with proper structure
                const itemData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as BucketListCategory,
                  priority: formData.get('priority') as Priority,
                  status: formData.get('status') as ItemStatus,
                  difficulty: formData.get('difficulty') as Difficulty,
                  estimatedCost: formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : undefined,
                  currency: 'USD',
                  targetDate: formData.get('targetDate') ? new Date(formData.get('targetDate') as string) : undefined,
                  completedDate: undefined,
                  progress: 0,
                  subGoals: [],
                  tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
                  location: formData.get('location') as string || undefined,
                  notes: formData.get('notes') as string || undefined,
                  inspiration: undefined,
                  timeToComplete: undefined,
                  seasonality: undefined,
                  prerequisites: [],
                  resources: [],
                  milestones: [],
                  achievements: [],
                  reminderDate: undefined,
                  isArchived: false,
                  isFavorite: false,
                };
                addItem(itemData);
              }
              
              setShowAddForm(false);
              setEditingItem(null);
              setFormErrors({});
            }}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={editingItem?.title || ''}
                    required
                    placeholder="What do you want to achieve?"
                    className={formErrors.title ? 'error' : ''}
                  />
                  {formErrors.title && <span className="error-message">{formErrors.title}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingItem?.description || ''}
                    placeholder="Describe your goal in detail..."
                    rows={3}
                    className={formErrors.description ? 'error' : ''}
                  />
                  {formErrors.description && <span className="error-message">{formErrors.description}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingItem?.category || 'personal'}
                    required
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue={editingItem?.priority || 'medium'}
                    required
                    className={formErrors.priority ? 'error' : ''}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.priority && <span className="error-message">{formErrors.priority}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editingItem?.status || 'not_started'}
                    className={formErrors.status ? 'error' : ''}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && <span className="error-message">{formErrors.status}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty *</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    defaultValue={editingItem?.difficulty || 'medium'}
                    className={formErrors.difficulty ? 'error' : ''}
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {getDifficultyStars(difficulty)} {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.difficulty && <span className="error-message">{formErrors.difficulty}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="targetDate">Target Date</label>
                  <input
                    type="date"
                    id="targetDate"
                    name="targetDate"
                    defaultValue={editingItem?.targetDate ? editingItem.targetDate.toISOString().split('T')[0] : ''}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedCost">Estimated Cost</label>
                  <input
                    type="number"
                    id="estimatedCost"
                    name="estimatedCost"
                    defaultValue={editingItem?.estimatedCost || ''}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    defaultValue={editingItem?.location || ''}
                    placeholder="Where will this happen?"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    defaultValue={editingItem?.tags?.join(', ') || ''}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    defaultValue={editingItem?.notes || ''}
                    placeholder="Additional notes or thoughts..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useMemo } from 'react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdViewList,
  MdViewModule,
  MdFlag,
  MdStar,
  MdGpsFixed,
  MdCheck,
  MdRadioButtonUnchecked,
  MdCelebration,
  MdAssignment,
  MdAccessTime,
  MdDone
} from 'react-icons/md';
import { useBucketList } from '../contexts/BucketListContext';
import type {
  BucketListItem,
  BucketListCategory,
  Priority,
  ItemStatus,
  Difficulty,
  ViewMode,
} from '../types/bucketlist';

interface BucketListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BucketListModal({ isOpen, onClose }: BucketListModalProps) {
  const {
    items,
    settings,
    addItem,
    updateItem,
    deleteItem,
    updateProgress
  } = useBucketList();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BucketListCategory | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | ''>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(settings.viewMode);

  // Apply filters locally
  const filteredItems = useMemo(() => {
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

    return filtered.sort((a, b) => {
      switch (settings.sortBy) {
        case 'target_date':
          if (!a.targetDate && !b.targetDate) return 0;
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime();
      }
    });
  }, [items, searchTerm, selectedCategory, selectedPriority, selectedStatus, settings.sortBy]);

  const categories: BucketListCategory[] = [
    'travel', 'adventure', 'learning', 'career', 'health', 'relationships',
    'creativity', 'experiences', 'personal', 'financial', 'spiritual', 'other'
  ];

  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: ItemStatus[] = ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];



  const getCategoryDisplay = (category: BucketListCategory) => {
    const displays = {
      travel: 'Travel',
      adventure: 'Adventure',
      learning: 'Learning',
      career: 'Career',
      health: 'Health',
      relationships: 'Relationships',
      creativity: 'Creativity',
      experiences: 'Experiences',
      personal: 'Personal',
      financial: 'Financial',
      spiritual: 'Spiritual',
      other: 'Other'
    };
    return displays[category];
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

  const isOverdue = (targetDate?: Date) => {
    if (!targetDate) return false;
    return new Date(targetDate) < new Date();
  };

  const bucketStats = {
    total: items.length,
    pending: items.filter(item => item.status !== 'completed' && item.status !== 'cancelled').length,
    completed: items.filter(item => item.status === 'completed').length,
    overdue: items.filter(item => item.targetDate && isOverdue(item.targetDate) && item.status !== 'completed').length
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="shared-tasks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2><MdGpsFixed /> Bucket List</h2>
            <div className="task-stats">
              <span className="stat-item">
                <MdAssignment /> {bucketStats.total} total
              </span>
              <span className="stat-item pending">
                <MdAccessTime /> {bucketStats.pending} pending
              </span>
              <span className="stat-item completed">
                <MdDone /> {bucketStats.completed} done
              </span>
              {bucketStats.overdue > 0 && (
                <span className="stat-item overdue">
                  <MdFlag /> {bucketStats.overdue} overdue
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
          <div className="tasks-controls">
            <div className="search-filter-row">
              <div className="search-bar">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search bucket list items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-controls">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as BucketListCategory)}>
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryDisplay(category)}
                    </option>
                  ))}
                </select>
                
                <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value as Priority)}>
                  <option value="">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>

                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as ItemStatus)}>
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </option>
                  ))}
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
                  <MdAdd /> Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className={`tasks-container ${viewMode}`}>
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <MdGpsFixed className="empty-icon" />
                <h3>No items found</h3>
                <p>
                  {searchTerm || selectedCategory || selectedPriority || selectedStatus
                    ? 'Try adjusting your search or filters'
                    : 'Add your first bucket list item to get started!'
                  }
                </p>
                {!searchTerm && !selectedCategory && !selectedPriority && !selectedStatus && (
                  <button 
                    className="add-first-task-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    <MdAdd /> Add First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredItems.map((item) => (
                  <div key={item.id} className={`task-card ${item.status === 'completed' ? 'completed' : ''}`}>
                    <div className="task-header">
                      <button
                        className={`task-checkbox ${item.status === 'completed' ? 'checked' : ''}`}
                        onClick={() => updateItem(item.id, { 
                          status: item.status === 'completed' ? 'not_started' : 'completed',
                          progress: item.status === 'completed' ? 0 : 100
                        })}
                      >
                        {item.status === 'completed' ? <MdCheck /> : <MdRadioButtonUnchecked />}
                      </button>
                      
                      <div className="task-meta">
                        <span className="task-category">
                          {getCategoryDisplay(item.category)}
                        </span>
                        <span 
                          className="task-priority"
                          style={{ color: getPriorityColor(item.priority) }}
                        >
                          {item.priority}
                        </span>
                      </div>
                      
                      <div className="task-actions">
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

                    <div className="task-content">
                      <h3 className={`task-title ${item.status === 'completed' ? 'completed' : ''}`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="task-description">{item.description}</p>
                      )}
                      
                      <div className="task-details">
                        <div className="task-assignee">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {item.targetDate && (
                          <div className={`task-due-date ${isOverdue(item.targetDate) && item.status !== 'completed' ? 'overdue' : ''}`}>
                            <MdAccessTime />
                            <span>{formatDate(item.targetDate)}</span>
                            {isOverdue(item.targetDate) && item.status !== 'completed' && (
                              <span className="overdue-label">Overdue</span>
                            )}
                          </div>
                        )}

                        {item.estimatedCost && (
                          <div className="task-assignee">
                            <span>{formatCurrency(item.estimatedCost, item.currency)}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="bucket-item-progress">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className={`progress-percentage ${item.progress === 100 ? 'completed' : item.progress >= 75 ? 'high' : item.progress >= 50 ? 'medium' : 'low'}`}>
                            {item.progress}%
                          </span>
                          {item.progress === 100 && <span className="completion-badge"><MdCelebration /></span>}
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${item.progress === 100 ? 'completed' : item.progress >= 75 ? 'high' : item.progress >= 50 ? 'medium' : 'low'}`}
                            style={{ width: `${item.progress}%` }}
                          />
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

                      {/* Difficulty Stars */}
                      <div className="difficulty-display">
                        <span className="difficulty-label">Difficulty:</span>
                        <span className="difficulty-stars">{getDifficultyStars(item.difficulty)}</span>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="bucket-item-tags">
                          {item.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="form-overlay" onClick={() => setShowAddForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>Add New Bucket List Item</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>
                  <MdClose />
                </button>
              </div>
              
              <div className="form-content">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  const itemData = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as BucketListCategory,
                    priority: formData.get('priority') as Priority,
                    status: 'not_started' as ItemStatus,
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
                    reminderDate: undefined,
                    isArchived: false,
                    isFavorite: false,
                  };
                  
                  addItem(itemData);
                  setShowAddForm(false);
                }}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="What do you want to achieve?"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Describe your goal in detail..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" defaultValue="personal">
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {getCategoryDisplay(category)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" defaultValue="medium">
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select name="difficulty" defaultValue="medium">
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Target Date</label>
                      <input
                        type="date"
                        name="targetDate"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Estimated Cost</label>
                      <input
                        type="number"
                        name="estimatedCost"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Where will this happen?"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      placeholder="Additional notes or thoughts..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="form-overlay" onClick={() => setEditingItem(null)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>Edit Bucket List Item</h3>
                <button className="close-btn" onClick={() => setEditingItem(null)}>
                  <MdClose />
                </button>
              </div>
              
              <div className="form-content">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  const updates: Partial<BucketListItem> = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as BucketListCategory,
                    priority: formData.get('priority') as Priority,
                    status: formData.get('status') as ItemStatus,
                    difficulty: formData.get('difficulty') as Difficulty,
                    estimatedCost: formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : undefined,
                    targetDate: formData.get('targetDate') ? new Date(formData.get('targetDate') as string) : undefined,
                    tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
                    location: formData.get('location') as string || undefined,
                    notes: formData.get('notes') as string || undefined,
                  };
                  
                  updateItem(editingItem.id, updates);
                  setEditingItem(null);
                }}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingItem.title}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingItem.description}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" defaultValue={editingItem.category}>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {getCategoryDisplay(category)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" defaultValue={editingItem.priority}>
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" defaultValue={editingItem.status}>
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select name="difficulty" defaultValue={editingItem.difficulty}>
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Target Date</label>
                      <input
                        type="date"
                        name="targetDate"
                        defaultValue={editingItem.targetDate ? editingItem.targetDate.toISOString().split('T')[0] : ''}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Estimated Cost</label>
                      <input
                        type="number"
                        name="estimatedCost"
                        defaultValue={editingItem.estimatedCost || ''}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingItem.location || ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingItem.tags?.join(', ') || ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      defaultValue={editingItem.notes || ''}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditingItem(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

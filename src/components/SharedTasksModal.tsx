import { useState } from 'react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheck,
  MdRadioButtonUnchecked,
  MdPerson,
  MdToday,
  MdFlag,
  MdSearch,
  MdFilterList,
  MdSort,
  MdViewList,
  MdViewModule,
  MdDone,
  MdAccessTime,
  MdAssignment,
  MdShare
} from 'react-icons/md';

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assignedTo: 'both' | 'me' | 'partner';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdDate: string;
  completedDate?: string;
  category: 'household' | 'planning' | 'shopping' | 'personal' | 'dates' | 'other';
}

interface SharedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SharedTasksModal({ isOpen, onClose }: SharedTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Plan weekend date night',
      description: 'Research restaurants and make reservation',
      isCompleted: false,
      assignedTo: 'both',
      priority: 'high',
      dueDate: '2025-02-15',
      createdDate: '2025-02-10',
      category: 'dates'
    },
    {
      id: '2',
      title: 'Buy groceries for dinner',
      description: 'Get ingredients for homemade pasta',
      isCompleted: true,
      assignedTo: 'me',
      priority: 'medium',
      dueDate: '2025-02-12',
      createdDate: '2025-02-11',
      completedDate: '2025-02-12',
      category: 'shopping'
    },
    {
      id: '3',
      title: 'Book movie tickets',
      isCompleted: false,
      assignedTo: 'partner',
      priority: 'medium',
      dueDate: '2025-02-16',
      createdDate: '2025-02-10',
      category: 'planning'
    },
    {
      id: '4',
      title: 'Clean the apartment',
      description: 'Tidy up before date night',
      isCompleted: false,
      assignedTo: 'both',
      priority: 'low',
      createdDate: '2025-02-11',
      category: 'household'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'me' | 'partner' | 'both'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority' | 'title'>('created');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedTo: 'both',
    priority: 'medium',
    dueDate: '',
    category: 'other'
  });

  const categories = [
    { value: 'household', label: 'Household' },
    { value: 'planning', label: 'Planning' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'personal', label: 'Personal' },
    { value: 'dates', label: 'Dates' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
  ];

  const assignees = [
    { value: 'both', label: 'Both' },
    { value: 'me', label: 'Me' },
    { value: 'partner', label: 'Partner' }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterBy) {
      case 'pending':
        matchesFilter = !task.isCompleted;
        break;
      case 'completed':
        matchesFilter = task.isCompleted;
        break;
      case 'me':
        matchesFilter = task.assignedTo === 'me' || task.assignedTo === 'both';
        break;
      case 'partner':
        matchesFilter = task.assignedTo === 'partner' || task.assignedTo === 'both';
        break;
      case 'both':
        matchesFilter = task.assignedTo === 'both';
        break;
    }
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'due':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
  });

  const handleAddTask = () => {
    if (!newTask.title?.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      isCompleted: false,
      assignedTo: newTask.assignedTo as 'both' | 'me' | 'partner',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      dueDate: newTask.dueDate || undefined,
      createdDate: new Date().toISOString().split('T')[0],
      category: newTask.category as Task['category']
    };
    
    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      assignedTo: 'both',
      priority: 'medium',
      dueDate: '',
      category: 'other'
    });
    setShowAddForm(false);
  };

  const handleEditTask = () => {
    if (!editingTask || !editingTask.title?.trim()) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            isCompleted: !task.isCompleted,
            completedDate: !task.isCompleted ? new Date().toISOString().split('T')[0] : undefined
          }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getAssigneeDisplay = (assignedTo: Task['assignedTo']) => {
    const assignee = assignees.find(a => a.value === assignedTo);
    return assignee ? assignee.label : assignedTo;
  };

  const getCategoryDisplay = (category: Task['category']) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.isCompleted).length,
    completed: tasks.filter(t => t.isCompleted).length,
    overdue: tasks.filter(t => !t.isCompleted && isOverdue(t.dueDate)).length
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="shared-tasks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2><MdShare /> Shared Tasks</h2>
            <div className="task-stats">
              <span className="stat-item">
                <MdAssignment /> {stats.total} total
              </span>
              <span className="stat-item pending">
                <MdAccessTime /> {stats.pending} pending
              </span>
              <span className="stat-item completed">
                <MdDone /> {stats.completed} done
              </span>
              {stats.overdue > 0 && (
                <span className="stat-item overdue">
                  <MdFlag /> {stats.overdue} overdue
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
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-controls">
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as any)}>
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="me">My Tasks</option>
                  <option value="partner">Partner's Tasks</option>
                  <option value="both">Shared Tasks</option>
                </select>
                
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="created">Date Created</option>
                  <option value="due">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
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
                  <MdAdd /> Add Task
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className={`tasks-container ${viewMode}`}>
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <MdAssignment className="empty-icon" />
                <h3>No tasks found</h3>
                <p>
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first shared task to get started!'
                  }
                </p>
                {!searchTerm && filterBy === 'all' && (
                  <button 
                    className="add-first-task-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    <MdAdd /> Add First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map((task) => (
                  <div key={task.id} className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-header">
                      <button
                        className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        {task.isCompleted ? <MdCheck /> : <MdRadioButtonUnchecked />}
                      </button>
                      
                      <div className="task-meta">
                        <span className="task-category">
                          {getCategoryDisplay(task.category)}
                        </span>
                        <span 
                          className="task-priority"
                          style={{ color: priorities.find(p => p.value === task.priority)?.color }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="task-actions">
                        <button
                          className="edit-btn"
                          onClick={() => setEditingTask(task)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task.id)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>

                    <div className="task-content">
                      <h3 className={`task-title ${task.isCompleted ? 'completed' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      
                      <div className="task-details">
                        <div className="task-assignee">
                          <MdPerson />
                          <span>{getAssigneeDisplay(task.assignedTo)}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className={`task-due-date ${isOverdue(task.dueDate) && !task.isCompleted ? 'overdue' : ''}`}>
                            <MdToday />
                            <span>{formatDate(task.dueDate)}</span>
                            {isOverdue(task.dueDate) && !task.isCompleted && (
                              <span className="overdue-label">Overdue</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        {showAddForm && (
          <div className="form-overlay" onClick={() => setShowAddForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>Add New Task</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>
                  <MdClose />
                </button>
              </div>
              
              <div className="form-content">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Add more details..."
                    rows={3}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned To</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value as any })}
                    >
                      {assignees.map(assignee => (
                        <option key={assignee.value} value={assignee.value}>
                          {assignee.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate || ''}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-btn"
                    onClick={handleAddTask}
                    disabled={!newTask.title?.trim()}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="form-overlay" onClick={() => setEditingTask(null)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>Edit Task</h3>
                <button className="close-btn" onClick={() => setEditingTask(null)}>
                  <MdClose />
                </button>
              </div>
              
              <div className="form-content">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    placeholder="Add more details..."
                    rows={3}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned To</label>
                    <select
                      value={editingTask.assignedTo}
                      onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value as any })}
                    >
                      {assignees.map(assignee => (
                        <option key={assignee.value} value={assignee.value}>
                          {assignee.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as any })}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={editingTask.dueDate || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-btn"
                    onClick={handleEditTask}
                    disabled={!editingTask.title?.trim()}
                  >
                    Save Changes
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

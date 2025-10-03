import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type {
  BucketListItem,
  BucketListContextType,
  BucketListFilters,
  BucketListSettings,
  BucketListStats,
  BucketListInsights,
  BucketListRecommendation,
  SubGoal,
  Milestone,
  Priority,
  BucketListCategory,
  ItemStatus,
  SortOption
} from '../types/bucketlist';

interface BucketListState {
  items: BucketListItem[];
  filters: BucketListFilters;
  settings: BucketListSettings;
  isLoading: boolean;
}

type BucketListAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: BucketListItem[] }
  | { type: 'ADD_ITEM'; payload: BucketListItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<BucketListItem> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'BULK_UPDATE'; payload: { ids: string[]; updates: Partial<BucketListItem> } }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<BucketListFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<BucketListSettings> };

const defaultFilters: BucketListFilters = {
  showArchived: false,
  showFavorites: false,
};

const defaultSettings: BucketListSettings = {
  defaultCurrency: 'USD',
  reminderSettings: {
    enabled: true,
    daysBeforeTarget: 7,
    frequency: 'weekly',
  },
  viewMode: 'grid',
  sortBy: 'created_date',
  sortOrder: 'desc',
  showProgress: true,
  showCosts: true,
  showDates: true,
  enableMotivation: true,
  enableAnalytics: true,
};

const initialState: BucketListState = {
  items: [],
  filters: defaultFilters,
  settings: defaultSettings,
  isLoading: false,
};

function bucketListReducer(state: BucketListState, action: BucketListAction): BucketListState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedDate: new Date() }
            : item
        ),
      };
    
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'BULK_UPDATE':
      return {
        ...state,
        items: state.items.map(item =>
          action.payload.ids.includes(item.id)
            ? { ...item, ...action.payload.updates, updatedDate: new Date() }
            : item
        ),
      };
    
    case 'BULK_DELETE':
      return {
        ...state,
        items: state.items.filter(item => !action.payload.includes(item.id)),
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'CLEAR_FILTERS':
      return { ...state, filters: defaultFilters };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    default:
      return state;
  }
}

const BucketListContext = createContext<BucketListContextType | undefined>(undefined);

export function BucketListProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bucketListReducer, initialState);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadSupabaseItems() {
      try {
        const { data, error } = await import('../services/supabase').then(m => m.fetchBucketListItems());
        if (error) {
          console.error('Error fetching bucket list items from Supabase:', error);
          return;
        }
        if (data) {
          // Map Supabase fields to BucketListItem
const items = data.map((item: any) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category,
  priority: item.priority,
  status: item.status,
  difficulty: item.difficulty,
  estimatedCost: item.estimated_cost,
  currency: item.currency,
  targetDate: item.target_date ? new Date(item.target_date) : undefined,
  completedDate: item.completed_date ? new Date(item.completed_date) : undefined,
  progress: typeof item.progress === 'number' ? item.progress : 0,
  subGoals: Array.isArray(item.sub_goals) ? item.sub_goals : [],
  tags: Array.isArray(item.tags) ? item.tags : [],
  location: item.location,
  notes: item.notes,
  inspiration: item.inspiration,
  timeToComplete: item.time_to_complete,
  seasonality: item.seasonality,
  prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : [],
  resources: Array.isArray(item.resources) ? item.resources : [],
  milestones: Array.isArray(item.milestones) ? item.milestones : [],
  reminderDate: item.reminder_date ? new Date(item.reminder_date) : undefined,
  isArchived: typeof item.is_archived === 'boolean' ? item.is_archived : false,
  isFavorite: typeof item.is_favorite === 'boolean' ? item.is_favorite : false,
  createdDate: item.created_at ? new Date(item.created_at) : new Date(),
  updatedDate: new Date()
}));
          dispatch({ type: 'SET_ITEMS', payload: items });
        }
      } catch (error) {
        console.error('Error loading bucket list items from Supabase:', error);
      }
    }
    loadSupabaseItems();
  }, []);

  // Save data to localStorage when items or settings change
  useEffect(() => {
    localStorage.setItem('bucketListItems', JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    localStorage.setItem('bucketListSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Generate unique ID
  const generateId = () => `bucket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // CRUD operations
  const addItem = (itemData: Omit<BucketListItem, 'id' | 'createdDate' | 'updatedDate'>) => {
    const newItem: BucketListItem = {
      ...itemData,
      id: generateId(),
      createdDate: new Date(),
      updatedDate: new Date(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  const updateItem = async (id: string, updates: Partial<BucketListItem>) => {
    // Convert targetDate to string if present
    const supabaseUpdates: any = { ...updates };
    if (supabaseUpdates.targetDate instanceof Date) {
      supabaseUpdates.targetDate = supabaseUpdates.targetDate.toISOString();
    }
    // Persist to Supabase
    await import('../services/supabase').then(m => m.updateBucketListItem(id, supabaseUpdates));
    // Refetch items to sync UI
    const { data } = await import('../services/supabase').then(m => m.fetchBucketListItems());
    if (data) {
      const items = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        difficulty: item.difficulty,
        estimatedCost: item.estimated_cost,
        currency: item.currency,
        targetDate: item.target_date ? new Date(item.target_date) : undefined,
        completedDate: item.completed_date ? new Date(item.completed_date) : undefined,
        progress: typeof item.progress === 'number' ? item.progress : 0,
        subGoals: Array.isArray(item.sub_goals) ? item.sub_goals : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        location: item.location,
        notes: item.notes,
        inspiration: item.inspiration,
        timeToComplete: item.time_to_complete,
        seasonality: item.seasonality,
        prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : [],
        resources: Array.isArray(item.resources) ? item.resources : [],
        milestones: Array.isArray(item.milestones) ? item.milestones : [],
        reminderDate: item.reminder_date ? new Date(item.reminder_date) : undefined,
        isArchived: typeof item.is_archived === 'boolean' ? item.is_archived : false,
        isFavorite: typeof item.is_favorite === 'boolean' ? item.is_favorite : false,
        createdDate: item.created_at ? new Date(item.created_at) : new Date(),
        updatedDate: new Date()
      }));
      dispatch({ type: 'SET_ITEMS', payload: items });
    }
  };

  const deleteItem = async (id: string) => {
    await import('../services/supabase').then(m => m.deleteBucketListItem(id));
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const duplicateItem = (id: string) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      const duplicatedItem = {
        ...item,
        title: `${item.title} (Copy)`,
        status: 'not_started' as ItemStatus,
        progress: 0,
        completedDate: undefined,
        subGoals: item.subGoals.map(sg => ({ ...sg, id: generateId(), isCompleted: false })),
        milestones: item.milestones.map(m => ({ ...m, id: generateId(), isCompleted: false })),
      };
      addItem(duplicatedItem);
    }
  };

  const archiveItem = (id: string) => {
    updateItem(id, { isArchived: true });
  };

  const toggleFavorite = (id: string) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      updateItem(id, { isFavorite: !item.isFavorite });
    }
  };

  // Sub-goals management
  const addSubGoal = (itemId: string, subGoalData: Omit<SubGoal, 'id'>) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const newSubGoal: SubGoal = {
        ...subGoalData,
        id: generateId(),
      };
      const updatedSubGoals = [...item.subGoals, newSubGoal];
      updateItem(itemId, { subGoals: updatedSubGoals });
    }
  };

  const updateSubGoal = (itemId: string, subGoalId: string, updates: Partial<SubGoal>) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const updatedSubGoals = item.subGoals.map(sg =>
        sg.id === subGoalId ? { ...sg, ...updates } : sg
      );
      updateItem(itemId, { subGoals: updatedSubGoals });
      
      // Update overall progress
      const completedSubGoals = updatedSubGoals.filter(sg => sg.isCompleted).length;
      const progress = updatedSubGoals.length > 0 ? (completedSubGoals / updatedSubGoals.length) * 100 : 0;
      updateItem(itemId, { progress });
    }
  };

  const deleteSubGoal = (itemId: string, subGoalId: string) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const updatedSubGoals = item.subGoals.filter(sg => sg.id !== subGoalId);
      updateItem(itemId, { subGoals: updatedSubGoals });
    }
  };

  const toggleSubGoal = (itemId: string, subGoalId: string) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const subGoal = item.subGoals.find(sg => sg.id === subGoalId);
      if (subGoal) {
        updateSubGoal(itemId, subGoalId, {
          isCompleted: !subGoal.isCompleted,
          completedDate: !subGoal.isCompleted ? new Date() : undefined,
        });
      }
    }
  };

  // Progress and milestones
  const updateProgress = async (id: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const updates: Partial<BucketListItem> = { progress: clampedProgress };
    
    if (clampedProgress === 100) {
      updates.status = 'completed';
      updates.completedDate = new Date();
    } else if (clampedProgress > 0) {
      updates.status = 'in_progress';
    }
    
    await updateItem(id, updates);
  };

  const addMilestone = (itemId: string, milestoneData: Omit<Milestone, 'id'>) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const newMilestone: Milestone = {
        ...milestoneData,
        id: generateId(),
      };
      const updatedMilestones = [...item.milestones, newMilestone];
      updateItem(itemId, { milestones: updatedMilestones });
    }
  };

  const completeMilestone = (itemId: string, milestoneId: string) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      const updatedMilestones = item.milestones.map(m =>
        m.id === milestoneId
          ? { ...m, isCompleted: true, completedDate: new Date(), progress: 100 }
          : m
      );
      updateItem(itemId, { milestones: updatedMilestones });
    }
  };

  // Filtering and sorting
  const setFilters = (filters: Partial<BucketListFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const setSortBy = (sortBy: SortOption, order: 'asc' | 'desc' = 'desc') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { sortBy, sortOrder: order } });
  };

  // Bulk operations
  const bulkUpdate = (ids: string[], updates: Partial<BucketListItem>) => {
    dispatch({ type: 'BULK_UPDATE', payload: { ids, updates } });
  };

  const bulkDelete = (ids: string[]) => {
    dispatch({ type: 'BULK_DELETE', payload: ids });
  };

  const bulkArchive = (ids: string[]) => {
    bulkUpdate(ids, { isArchived: true });
  };

  // Settings
  const updateSettings = (settings: Partial<BucketListSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };



  // Computed values
  const filteredItems = useMemo(() => {
    let filtered = state.items.filter(item => {
      if (!state.filters.showArchived && item.isArchived) return false;
      if (state.filters.showFavorites && !item.isFavorite) return false;
      if (state.filters.category && item.category !== state.filters.category) return false;
      if (state.filters.priority && item.priority !== state.filters.priority) return false;
      if (state.filters.status && item.status !== state.filters.status) return false;
      if (state.filters.difficulty && item.difficulty !== state.filters.difficulty) return false;
      if (state.filters.searchTerm) {
        const searchLower = state.filters.searchTerm.toLowerCase();
        if (!item.title.toLowerCase().includes(searchLower) &&
            !item.description?.toLowerCase().includes(searchLower) &&
            !item.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      if (state.filters.tags && state.filters.tags.length > 0) {
        if (!state.filters.tags.some(tag => item.tags.includes(tag))) return false;
      }
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = state.settings;
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_date':
          comparison = (a.createdDate?.getTime?.() ?? 0) - (b.createdDate?.getTime?.() ?? 0);
          break;
        case 'updated_date':
          comparison = (a.updatedDate?.getTime?.() ?? 0) - (b.updatedDate?.getTime?.() ?? 0);
          break;
        case 'target_date':
          const aDate = a.targetDate?.getTime?.() ?? 0;
          const bDate = b.targetDate?.getTime?.() ?? 0;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3, extreme: 4 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'cost':
          comparison = (a.estimatedCost || 0) - (b.estimatedCost || 0);
          break;
        default:
          comparison = (a.createdDate?.getTime?.() ?? 0) - (b.createdDate?.getTime?.() ?? 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.items, state.filters, state.settings.sortBy, state.settings.sortOrder]);

  const stats = useMemo((): BucketListStats => {
    const items = state.items.filter(item => !item.isArchived);
    const completed = items.filter(item => item.status === 'completed');
    const inProgress = items.filter(item => item.status === 'in_progress');
    const notStarted = items.filter(item => item.status === 'not_started');
    
    const categoriesCount = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<BucketListCategory, number>);
    
    const prioritiesCount = items.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    
    const totalEstimatedCost = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    const averageProgress = items.length > 0 ? items.reduce((sum, item) => sum + item.progress, 0) / items.length : 0;
    
    return {
      totalItems: items.length,
      completedItems: completed.length,
      inProgressItems: inProgress.length,
      notStartedItems: notStarted.length,
      totalEstimatedCost,
      averageProgress,
      completionRate: items.length > 0 ? (completed.length / items.length) * 100 : 0,
      categoriesCount,
      prioritiesCount,
      monthlyProgress: [], // Would be calculated based on completion dates
      streakDays: 0, // Would track consecutive days with activity
      longestStreak: 0,
    };
  }, [state.items]);

  // Analytics and insights
  const getInsights = (): BucketListInsights => {
    const items = state.items.filter(item => !item.isArchived);
    const now = new Date();
    
    return {
      mostActiveCategory: 'travel', // Would calculate based on recent activity
      averageCompletionTime: 30, // Would calculate based on completed items
      costEfficiencyRating: 85,
      motivationLevel: 75,
      upcomingDeadlines: items.filter(item => 
        item.targetDate && item.targetDate > now && 
        (item.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30
      ),
      overdueItems: items.filter(item => 
        item.targetDate && item.targetDate < now && item.status !== 'completed'
      ),
      quickWins: items.filter(item => 
        item.difficulty === 'easy' && item.status === 'not_started'
      ),
      challengingGoals: items.filter(item => 
        item.difficulty === 'extreme' && item.status !== 'completed'
      ),
      seasonalSuggestions: [],
    };
  };

  const getRecommendations = (): BucketListRecommendation[] => {
    const insights = getInsights();
    const recommendations: BucketListRecommendation[] = [];
    
    if (insights.overdueItems.length > 0) {
      recommendations.push({
        id: generateId(),
        type: 'deadline_reminder',
        title: 'Overdue Items',
        description: `You have ${insights.overdueItems.length} overdue items that need attention.`,
        actionText: 'Review Overdue Items',
        priority: 'high',
      });
    }
    
    if (insights.quickWins.length > 0) {
      recommendations.push({
        id: generateId(),
        type: 'motivation_boost',
        title: 'Quick Wins Available',
        description: `Complete ${insights.quickWins.length} easy items to boost your momentum.`,
        actionText: 'View Quick Wins',
        priority: 'medium',
      });
    }
    
    return recommendations;
  };

  // Import/Export
  const exportData = (): string => {
    return JSON.stringify({
      items: state.items,
      settings: state.settings,
      exportDate: new Date().toISOString(),
    }, null, 2);
  };

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.items && Array.isArray(parsed.items)) {
        dispatch({ type: 'SET_ITEMS', payload: parsed.items });
      }
      if (parsed.settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: parsed.settings });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  };

  const setItems = (items: BucketListItem[]) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  };

  const contextValue: BucketListContextType = useMemo(() => ({
    items: state.items,
    filteredItems,
    filters: state.filters,
    settings: state.settings,
    stats,
    isLoading: state.isLoading,
    
    // CRUD operations
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    archiveItem,
    toggleFavorite,
    
    // Sub-goals
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    toggleSubGoal,
    
    // Progress and milestones
    updateProgress,
    addMilestone,
    completeMilestone,
    
    // Filtering and sorting
    setFilters,
    clearFilters,
    setSortBy,
    
    // Bulk operations
    bulkUpdate,
    bulkDelete,
    bulkArchive,
    
    // Settings
    updateSettings,
    setItems,
    
    // Analytics and insights
    getInsights,
    getRecommendations,
    
    // Import/Export
    exportData,
    importData,
  }), [
    state.items,
    state.filters,
    state.settings,
    state.isLoading,
    filteredItems,
    stats,
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    archiveItem,
    toggleFavorite,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    toggleSubGoal,
    updateProgress,
    addMilestone,
    completeMilestone,
    setFilters,
    clearFilters,
    setSortBy,
    bulkUpdate,
    bulkDelete,
    bulkArchive,
    updateSettings,
    setItems,
    getInsights,
    getRecommendations,
    exportData,
    importData,
  ]);

  return (
    <BucketListContext.Provider value={contextValue}>
      {children}
    </BucketListContext.Provider>
  );
}

export function useBucketList() {
  const context = useContext(BucketListContext);
  if (context === undefined) {
    throw new Error('useBucketList must be used within a BucketListProvider');
  }
  return context;
}

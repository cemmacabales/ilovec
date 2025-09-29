export interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  category: BucketListCategory;
  priority: Priority;
  status: ItemStatus;
  difficulty: Difficulty;
  estimatedCost?: number;
  currency?: string;
  targetDate?: Date;
  completedDate?: Date;
  createdDate: Date;
  updatedDate: Date;
  progress: number; // 0-100
  subGoals: SubGoal[];
  tags: string[];
  location?: string;
  notes?: string;
  inspiration?: string;
  timeToComplete?: number; // in days
  seasonality?: string;
  prerequisites?: string[];
  resources?: Resource[];
  milestones: Milestone[];
  reminderDate?: Date;
  isArchived: boolean;
  isFavorite: boolean;
}

export interface SubGoal {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedDate?: Date;
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  url?: string;
  type: ResourceType;
  description?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  completedDate?: Date;
  isCompleted: boolean;
  progress: number;
}



export interface BucketListStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  totalEstimatedCost: number;
  averageProgress: number;
  completionRate: number;
  categoriesCount: Record<BucketListCategory, number>;
  prioritiesCount: Record<Priority, number>;
  monthlyProgress: MonthlyProgress[];
  streakDays: number;
  longestStreak: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  completed: number;
  added: number;
}

export interface BucketListFilters {
  category?: BucketListCategory;
  priority?: Priority;
  status?: ItemStatus;
  difficulty?: Difficulty;
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  costRange?: {
    min: number;
    max: number;
  };
  showArchived: boolean;
  showFavorites: boolean;
}

export interface BucketListSettings {
  defaultCurrency: string;
  reminderSettings: {
    enabled: boolean;
    daysBeforeTarget: number;
    frequency: ReminderFrequency;
  };
  viewMode: ViewMode;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  showProgress: boolean;
  showCosts: boolean;
  showDates: boolean;
  enableMotivation: boolean;
  enableAnalytics: boolean;
}

export type BucketListCategory = 
  | 'travel'
  | 'adventure'
  | 'learning'
  | 'career'
  | 'health'
  | 'relationships'
  | 'creativity'
  | 'experiences'
  | 'personal'
  | 'financial'
  | 'spiritual'
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ItemStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type ResourceType = 'website' | 'book' | 'video' | 'course' | 'contact' | 'document' | 'other';



export type ViewMode = 'grid' | 'list' | 'timeline' | 'kanban';

export type SortOption = 
  | 'created_date'
  | 'updated_date'
  | 'target_date'
  | 'priority'
  | 'progress'
  | 'title'
  | 'category'
  | 'difficulty'
  | 'cost';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly';

export interface BucketListContextType {
  items: BucketListItem[];
  filteredItems: BucketListItem[];
  filters: BucketListFilters;
  settings: BucketListSettings;
  stats: BucketListStats;
  isLoading: boolean;
  
  // CRUD operations
  addItem: (item: Omit<BucketListItem, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateItem: (id: string, updates: Partial<BucketListItem>) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  archiveItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Sub-goals
  addSubGoal: (itemId: string, subGoal: Omit<SubGoal, 'id'>) => void;
  updateSubGoal: (itemId: string, subGoalId: string, updates: Partial<SubGoal>) => void;
  deleteSubGoal: (itemId: string, subGoalId: string) => void;
  toggleSubGoal: (itemId: string, subGoalId: string) => void;
  
  // Progress and milestones
  updateProgress: (id: string, progress: number) => void;
  addMilestone: (itemId: string, milestone: Omit<Milestone, 'id'>) => void;
  completeMilestone: (itemId: string, milestoneId: string) => void;
  
  // Filtering and sorting
  setFilters: (filters: Partial<BucketListFilters>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortOption, order?: 'asc' | 'desc') => void;
  
  // Bulk operations
  bulkUpdate: (ids: string[], updates: Partial<BucketListItem>) => void;
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  
  // Settings
  updateSettings: (settings: Partial<BucketListSettings>) => void;
  
  // Analytics and insights
  getInsights: () => BucketListInsights;
  getRecommendations: () => BucketListRecommendation[];
  
  // Import/Export
  exportData: () => string;
  importData: (data: string) => void;
}

export interface BucketListInsights {
  mostActiveCategory: BucketListCategory;
  averageCompletionTime: number;
  costEfficiencyRating: number;
  motivationLevel: number;
  upcomingDeadlines: BucketListItem[];
  overdueItems: BucketListItem[];
  quickWins: BucketListItem[];
  challengingGoals: BucketListItem[];
  seasonalSuggestions: BucketListItem[];
}

export interface BucketListRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  actionText: string;
  priority: Priority;
  relatedItemId?: string;
}

export type RecommendationType = 
  | 'deadline_reminder'
  | 'progress_update'
  | 'cost_optimization'
  | 'category_balance'
  | 'seasonal_timing'
  | 'skill_building'
  | 'motivation_boost';
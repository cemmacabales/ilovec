import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { TrackedItem, WatchlistState } from '../types/tmdb';

// Action types
type WatchlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: TrackedItem[] }
  | { type: 'ADD_ITEM'; payload: TrackedItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<TrackedItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ALL' };

// Initial state
const initialState: WatchlistState = {
  items: [],
  loading: false,
  error: null,
};

// Reducer
function watchlistReducer(state: WatchlistState, action: WatchlistAction): WatchlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null };
    
    case 'ADD_ITEM':
      // Check if item already exists
      const existingIndex = state.items.findIndex(item => 
        item.tmdbId === action.payload.tmdbId && item.type === action.payload.type
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = action.payload;
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload] };
      }
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'CLEAR_ALL':
      return { ...state, items: [] };
    
    default:
      return state;
  }
}

// Context
interface WatchlistContextType {
  state: WatchlistState;
  addToWatchlist: (item: Omit<TrackedItem, 'id' | 'dateAdded'>) => void;
  updateItem: (id: string, updates: Partial<TrackedItem>) => void;
  removeFromWatchlist: (id: string) => void;
  clearWatchlist: () => void;
  isInWatchlist: (tmdbId: number, type: 'movie' | 'tv') => boolean;
  getItemByTmdbId: (tmdbId: number, type: 'movie' | 'tv') => TrackedItem | undefined;
  getItemsByStatus: (status: TrackedItem['status']) => TrackedItem[];
  getMovies: () => TrackedItem[];
  getTVShows: () => TrackedItem[];
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Provider component
interface WatchlistProviderProps {
  children: React.ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('watchlist');
      if (savedItems) {
        const items = JSON.parse(savedItems);
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load watchlist' });
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('watchlist', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving watchlist to localStorage:', error);
    }
  }, [state.items]);

  // Helper functions
  const addToWatchlist = (item: Omit<TrackedItem, 'id' | 'dateAdded'>) => {
    const newItem: TrackedItem = {
      ...item,
      id: `${item.type}-${item.tmdbId}-${Date.now()}`,
      dateAdded: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  const updateItem = (id: string, updates: Partial<TrackedItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  const removeFromWatchlist = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearWatchlist = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const isInWatchlist = (tmdbId: number, type: 'movie' | 'tv'): boolean => {
    return state.items.some(item => item.tmdbId === tmdbId && item.type === type);
  };

  const getItemByTmdbId = (tmdbId: number, type: 'movie' | 'tv'): TrackedItem | undefined => {
    return state.items.find(item => item.tmdbId === tmdbId && item.type === type);
  };

  const getItemsByStatus = (status: TrackedItem['status']): TrackedItem[] => {
    return state.items.filter(item => item.status === status);
  };

  const getMovies = (): TrackedItem[] => {
    return state.items.filter(item => item.type === 'movie');
  };

  const getTVShows = (): TrackedItem[] => {
    return state.items.filter(item => item.type === 'tv');
  };

  const value: WatchlistContextType = {
    state,
    addToWatchlist,
    updateItem,
    removeFromWatchlist,
    clearWatchlist,
    isInWatchlist,
    getItemByTmdbId,
    getItemsByStatus,
    getMovies,
    getTVShows,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

// Hook to use the context
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
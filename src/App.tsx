import React, { useState } from 'react';
/*
TODO: Link Movie/Series Tracker (TMDB API) to Supabase

- [ ] Analyze current movie/series tracker logic
- [ ] Design Supabase schema for movies/series
- [ ] Implement Supabase sync logic (add, fetch, update, delete)
- [ ] Update UI to reflect Supabase state
- [ ] Test integration
- [ ] Verify results
*/
import './App.css';
import { CalendarDays, Image, Wallet, ListChecks, Check, Music, Film, List } from 'lucide-react';
import GalleryModal from './components/GalleryModal';
import MusicModal from './components/MusicModal';
import MovieSeriesModal from './components/MovieSeriesModal';
import BudgetModal from './components/BudgetModal';
import BucketListModal from './components/BucketListModal';
import SharedTasksModal from './components/SharedTasksModal';
import UpcomingDatesModal from './components/UpcomingDatesModal';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { BudgetProvider, useBudget } from './contexts/BudgetContext';
import { BucketListProvider, useBucketList } from './contexts/BucketListContext';
import { fetchEvents } from './services/supabase';

function AppContent() {
  const { settings, getTotalSpentThisMonth } = useBudget();
  const [isUpcomingDatesModalOpen, setIsUpcomingDatesModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'PHP'
    }).format(amount);
  };

  const totalSpent = getTotalSpentThisMonth();
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isBucketListModalOpen, setIsBucketListModalOpen] = useState(false);
  const [isSharedTasksModalOpen, setIsSharedTasksModalOpen] = useState(false);

  // Movie Series Tracker count
  const [movieSeriesInProgress, setMovieSeriesInProgress] = useState(0);
  React.useEffect(() => {
    (async () => {
      const { data } = await import('./services/supabase').then(m => m.fetchMovieSeries());
      if (data) {
        setMovieSeriesInProgress(data.filter((item: any) => item.status === 'watching').length);
      }
    })();
  }, [isMovieModalOpen]);

  // Refetch shared tasks when modal closes
  React.useEffect(() => {
    if (!isSharedTasksModalOpen) {
      (async () => {
        const { data } = await import('./services/supabase').then(m => m.fetchSharedTasks());
        setSharedTasks(data || []);
      })();
    }
  }, [isSharedTasksModalOpen]);

  const [eventsCount, setEventsCount] = useState(0);
  const [sharedTasks, setSharedTasks] = useState<any[]>([]);
  const sharedTasksPendingCount = sharedTasks.filter(t => !t.is_completed).length;

  const openUpcomingDatesModal = () => setIsUpcomingDatesModalOpen(true);
  const closeUpcomingDatesModal = () => setIsUpcomingDatesModalOpen(false);
  
  const openGalleryModal = () => setIsGalleryModalOpen(true);
  const closeGalleryModal = () => setIsGalleryModalOpen(false);

  const openMusicModal = () => setIsMusicModalOpen(true);
  const closeMusicModal = () => setIsMusicModalOpen(false);

  const openMovieModal = () => setIsMovieModalOpen(true);
  const closeMovieModal = () => setIsMovieModalOpen(false);

  const openBudgetModal = () => setIsBudgetModalOpen(true);
  const closeBudgetModal = () => setIsBudgetModalOpen(false);

  const openBucketListModal = () => setIsBucketListModalOpen(true);
  const closeBucketListModal = () => setIsBucketListModalOpen(false);

  const openSharedTasksModal = () => setIsSharedTasksModalOpen(true);
  const closeSharedTasksModal = () => setIsSharedTasksModalOpen(false);

  // Fetch events count from Supabase on mount and when modal closes
  React.useEffect(() => {
    (async () => {
      const { data } = await fetchEvents();
      setEventsCount(data?.length || 0);
    })();
    // Fetch shared tasks from Supabase on mount
    (async () => {
      const { data } = await import('./services/supabase').then(m => m.fetchSharedTasks());
      setSharedTasks(data || []);
    })();
  }, []);

  // Update events count when modal closes
  React.useEffect(() => {
    if (!isUpcomingDatesModalOpen) {
      (async () => {
        const { data } = await fetchEvents();
        setEventsCount(data?.length || 0);
      })();
    }
  }, [isUpcomingDatesModalOpen]);

  return (
    <div className="app">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image">
          <div className="hero-overlay">
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="title">I Love C</h1>
            <div className="categories-link">
              <ListChecks className="categories-icon" />
              <span>Categories</span>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="category-grid">
            {/* Row 1 - Large Cards */}
            <div className="category-card large" onClick={openUpcomingDatesModal}>
              <div className="category-icon">
                <CalendarDays />
              </div>
              <h3>Upcoming Dates</h3>
              <p className="category-description">Events you're planning together - dinner, trips, movies</p>
              <div className="category-status">
                <span className="status-text">{eventsCount} upcoming events</span>
              </div>
            </div>

            <div className="category-card large" onClick={openGalleryModal}>
              <div className="category-icon">
                <Image />
              </div>
              <h3>Gallery</h3>
              <p className="category-description">Photo uploads of past dates with tags</p>
              <div className="category-status">
                <span className="status-text">24 memories saved</span>
              </div>
            </div>

            {/* Row 2 - Small Cards */}
            <div className="category-card small" onClick={openMusicModal} style={{ cursor: 'pointer' }}>
              <div className="category-icon">
                <Music />
              </div>
              <h3>Music Playlist</h3>
              <p className="category-description">Shared songs and couple's soundtrack</p>
              <div className="category-status">
                <span className="status-text">Apple Music Player</span>
              </div>
            </div>

            <div className="category-card small" onClick={openMovieModal} style={{ cursor: 'pointer' }}>
              <div className="category-icon">
                <Film />
              </div>
              <h3>Movie Series Tracker</h3>
              <p className="category-description">Track shows and movies to watch together</p>
              <div className="category-status">
                <span className="status-text">
                  {movieSeriesInProgress} in progress
                </span>
              </div>
            </div>

            <div className="category-card small" onClick={openBudgetModal} style={{ cursor: 'pointer' }}>
              <div className="category-icon">
                <Wallet />
              </div>
              <h3>Budget Tracker</h3>
              <p className="category-description">Estimated vs actual expenses</p>
              <div className="category-status">
                <span className="status-text">{formatCurrency(totalSpent)} this month</span>
              </div>
            </div>

            <div className="category-card small" onClick={openBucketListModal} style={{ cursor: 'pointer' }}>
              <div className="category-icon">
                <List />
              </div>
              <h3>Bucket List</h3>
              <p className="category-description">Adventures and experiences to share</p>
              <div className="category-status">
                <span className="status-text">
                  {useBucketList().stats.totalItems} goals
                </span>
              </div>
            </div>

            <div className="category-card small" onClick={openSharedTasksModal} style={{ cursor: 'pointer' }}>
              <div className="category-icon">
                <ListChecks />
              </div>
              <h3>Shared Tasks</h3>
              <p className="category-description">To-dos for both of you</p>
              <div className="category-status">
                <span className="status-text">
                  {sharedTasksPendingCount} pending
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Next Date */}
            <div className="next-date-section">
              <h2>Next Date</h2>
              <div className="next-date-card">
                <div className="date-display">
                  <div className="date-number">14</div>
                  <div className="date-month">FEB</div>
                  <div className="date-year">25</div>
                </div>
                <div className="date-details">
                  <h3>Dinner at Sunset Bistro</h3>
                  <p>7:30 PM • Downtown</p>
                  <p>Reservation confirmed <Check /></p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h2>Recent Activity</h2>
              <div className="activity-header">
                <CalendarDays className="activity-icon" />
                <span>Latest Updates</span>
              </div>
              
              <div className="activity-items">
                <div className="activity-item">
                  <div className="activity-time">2 hours ago</div>
                  <div className="activity-event">Added new photo to Gallery</div>
                  <div className="activity-location">Beach Trip</div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-time">Yesterday</div>
                  <div className="activity-event">Completed task: Buy movie tickets</div>
                  <div className="activity-location">Shared Tasks</div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-time">3 days ago</div>
                  <div className="activity-event">Added restaurant to Wishlist</div>
                  <div className="activity-location">Italian Cuisine</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-section">
              <h2>This Month</h2>
              <div className="stats-card">
                <div className="stat-item">
                  <div className="stat-number">6</div>
                  <div className="stat-label">Dates Planned</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatCurrency(totalSpent)}</div>
                  <div className="stat-label">Total Spent</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Photos Added</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Tasks Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dates Modal */}
      <UpcomingDatesModal 
        isOpen={isUpcomingDatesModalOpen} 
        onClose={closeUpcomingDatesModal} 
      />

      {/* Gallery Modal */}
      <GalleryModal 
        isOpen={isGalleryModalOpen} 
        onClose={closeGalleryModal} 
      />

      {/* Music Modal */}
      <MusicModal 
        isOpen={isMusicModalOpen} 
        onClose={closeMusicModal} 
      />

      {/* Movie Series Modal */}
      <MovieSeriesModal 
        isOpen={isMovieModalOpen} 
        onClose={closeMovieModal} 
      />

      {/* Budget Modal */}
      <BudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={closeBudgetModal} 
      />

      {/* Bucket List Modal */}
      <BucketListModal 
        isOpen={isBucketListModalOpen} 
        onClose={closeBucketListModal} 
      />

      {/* Shared Tasks Modal */}
      <SharedTasksModal 
        isOpen={isSharedTasksModalOpen} 
        onClose={closeSharedTasksModal} 
      />

    </div>
  );
}

function App() {
  return (
    <WatchlistProvider>
      <BudgetProvider>
        <BucketListProvider>
          <AppContent />
        </BucketListProvider>
      </BudgetProvider>
    </WatchlistProvider>
  );
}

export default App;

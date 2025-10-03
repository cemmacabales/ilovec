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
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import { CalendarDays, Image, Wallet, ListChecks, X, Plus, Check, Music, Film, List } from 'lucide-react';
import GalleryModal from './components/GalleryModal';
import MusicModal from './components/MusicModal';
import MovieSeriesModal from './components/MovieSeriesModal';
import BudgetModal from './components/BudgetModal';
import BucketListModal from './components/BucketListModal';
import SharedTasksModal from './components/SharedTasksModal';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { BudgetProvider, useBudget } from './contexts/BudgetContext';
import { BucketListProvider, useBucketList } from './contexts/BucketListContext';
import { addEvent, fetchEvents } from './services/supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

function AppContent() {
  const { settings, getTotalSpentThisMonth } = useBudget();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const [events, setEvents] = useState<Event[]>([]);
  const [sharedTasks, setSharedTasks] = useState<any[]>([]);
  const sharedTasksPendingCount = sharedTasks.filter(t => !t.is_completed).length;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '' });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : '';

  const openModal = () => setIsModalOpen(true);
  const openGalleryModal = () => setIsGalleryModalOpen(true);
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setShowAddForm(false);
      setNewEvent({ title: '', date: '', time: '', location: '' });
    }, 200);
  };
  
  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
  };

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



  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      await addEvent({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location
      });
      // Refresh events from Supabase
      const { data } = await fetchEvents();
      setEvents(data || []);
      setNewEvent({ title: '', date: '', time: '', location: '' });
      setShowAddForm(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Fetch events from Supabase on mount
  React.useEffect(() => {
    (async () => {
      const { data } = await fetchEvents();
      setEvents(data || []);
    })();
    // Fetch shared tasks from Supabase on mount
    (async () => {
      const { data } = await import('./services/supabase').then(m => m.fetchSharedTasks());
      setSharedTasks(data || []);
    })();
  }, []);

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };
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
<div className="category-card large" onClick={openModal}>
  <div className="category-icon">
    <CalendarDays />
  </div>
  <h3>Upcoming Dates</h3>
              <p className="category-description">Events you're planning together - dinner, trips, movies</p>
              <div className="category-status">
                <span className="status-text">{events.length} upcoming events</span>
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

      {/* Modal */}
      {isModalOpen && (
        <div className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} onClick={closeModal}>
          <div className={`modal-content ${isClosing ? 'modal-content-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upcoming Dates</h2>
<button className="close-button" onClick={closeModal}>
  <X />
</button>
            </div>
            
            <div className="modal-body">
              <div className="calendar-events-grid">
                <div className="calendar-ui-section">
                  <div className="calendar-ui-header">
                    <span className="calendar-ui-title">Select a date</span>
                  </div>
                  <Calendar
                    onChange={(date) => setSelectedDate(date as Date)}
                    value={selectedDate}
                    className="custom-calendar"
                    tileContent={({ date, view }) => {
                      if (view !== 'month') return null;
                      const dateStr = date.toISOString().slice(0, 10);
                      const hasEvent = events.some(ev => ev.date === dateStr);
                      return hasEvent ? <span className="event-dot" /> : null;
                    }}
                    tileClassName={({ date }) => {
                      const dateStr = date.toISOString().slice(0, 10);
                      return events.some(ev => ev.date === dateStr) ? 'event-date-highlight' : undefined;
                    }}
                  />
                </div>
                <div className="events-pane">
                  <div className="events-pane-header">
                    <div>
                      <h3>Events for {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '…'}</h3>
                      <span className="events-count">{selectedDate ? events.filter(e => e.date === selectedDateStr).length : events.length} {selectedDate ? 'event(s)' : 'total'}</span>
                    </div>
<button 
  className="add-event-button"
  onClick={() => {
    setShowAddForm(!showAddForm);
    if (!showAddForm && selectedDateStr) {
      setNewEvent({ ...newEvent, date: selectedDateStr });
    }
  }}
>
  <Plus /> Add Event
</button>
                  </div>
                  {showAddForm && (
                    <div className="add-event-form">
                      <input
                        type="text"
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      />
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      />
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      />
                      <div className="form-buttons">
                        <button className="save-button" onClick={handleAddEvent}>
                          Save Event
                        </button>
                        <button className="cancel-button" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
<div className="events-list compact-grid">
  {(() => {
    const list = selectedDate ? events.filter(e => e.date === selectedDateStr) : events;
    if (list.length === 0) {
      return (
        <div className="empty-events-card">
          <p>No events {selectedDate ? 'for this date yet.' : 'scheduled yet.'}</p>
        </div>
      );
    }
    return list.map((event) => (
      <div key={event.id} className="event-card">
        <div className="event-header">
<button className="event-checkbox">
  <Check />
</button>
          <div className="event-actions">
<button className="edit-btn">
  <Plus />
</button>
<button className="delete-btn">
  <X />
</button>
          </div>
        </div>
        <div className="event-content">
          <h4 className="event-title">{event.title}</h4>
          <div className="event-meta">
<span className="event-date"><CalendarDays /> {formatDate(event.date)}</span>
<span className="event-time"><CalendarDays /> {formatTime(event.time)}</span>
{event.location && <span className="event-location"><CalendarDays /> {event.location}</span>}
{selectedDate && event.date === selectedDateStr && (
  <span className="selected-label">Selected</span>
)}
          </div>
        </div>
      </div>
    ));
  })()}
</div>
                </div>
              </div>

              {showAddForm && (
                <div className="add-event-form">
                  <input
                    type="text"
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                  <div className="form-buttons">
                    <button className="save-button" onClick={handleAddEvent}>
                      Save Event
                    </button>
                    <button className="cancel-button" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="events-list">
                {events.length === 0 ? (
                  <p className="no-events">No events scheduled yet. Add your first event!</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-date">
                        <div className="event-day">{formatDate(event.date)}</div>
                        <div className="event-time">{formatTime(event.time)}</div>
                      </div>
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        {event.location && <p className="event-location">{event.location}</p>}
                          {selectedDate && event.date === selectedDate.toISOString().slice(0, 10) && (
                            <span style={{ color: '#d4a574', fontWeight: 500 }}>Selected</span>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

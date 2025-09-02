import './App.css';
import { useState } from 'react';
import { 
  MdDateRange, 
  MdPhotoLibrary, 
  MdAccountBalanceWallet, 
  MdChecklist,
  MdClose,
  MdAdd
} from 'react-icons/md';
import { FaMusic, FaFilm, FaListUl } from 'react-icons/fa';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Dinner at Sunset Bistro',
      date: '2025-02-14',
      time: '19:30',
      location: 'Downtown'
    },
    {
      id: '2',
      title: 'Movie Night',
      date: '2025-02-16',
      time: '20:00',
      location: 'Cinema Plaza'
    },
    {
      id: '3',
      title: 'Beach Walk',
      date: '2025-02-20',
      time: '10:00',
      location: 'Santa Monica'
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '' });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setShowAddForm(false);
    setNewEvent({ title: '', date: '', time: '', location: '' });
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location
      };
      setEvents([...events, event]);
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
              <MdChecklist className="categories-icon" />
              <span>Categories</span>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="category-grid">
            {/* Row 1 - Large Cards */}
            <div className="category-card large" onClick={openModal}>
              <div className="category-icon">
                <MdDateRange />
              </div>
              <h3>Upcoming Dates</h3>
              <p className="category-description">Events you're planning together - dinner, trips, movies</p>
              <div className="category-status">
                <span className="status-text">{events.length} upcoming events</span>
              </div>
            </div>

            <div className="category-card large">
              <div className="category-icon">
                <MdPhotoLibrary />
              </div>
              <h3>Gallery</h3>
              <p className="category-description">Photo uploads of past dates with tags</p>
              <div className="category-status">
                <span className="status-text">24 memories saved</span>
              </div>
            </div>

            {/* Row 2 - Small Cards */}
            <div className="category-card small">
              <div className="category-icon">
                <FaMusic />
              </div>
              <h3>Music Playlist</h3>
              <p className="category-description">Shared songs and couple's soundtrack</p>
              <div className="category-status">
                <span className="status-text">47 songs</span>
              </div>
            </div>

            <div className="category-card small">
              <div className="category-icon">
                <FaFilm />
              </div>
              <h3>Movie Series Tracker</h3>
              <p className="category-description">Track shows and movies to watch together</p>
              <div className="category-status">
                <span className="status-text">6 in progress</span>
              </div>
            </div>

            <div className="category-card small">
              <div className="category-icon">
                <MdAccountBalanceWallet />
              </div>
              <h3>Budget Tracker</h3>
              <p className="category-description">Estimated vs actual expenses</p>
              <div className="category-status">
                <span className="status-text">$450 this month</span>
              </div>
            </div>

            <div className="category-card small">
              <div className="category-icon">
                <FaListUl />
              </div>
              <h3>Bucket List</h3>
              <p className="category-description">Adventures and experiences to share</p>
              <div className="category-status">
                <span className="status-text">12 goals</span>
              </div>
            </div>

            <div className="category-card small">
              <div className="category-icon">
                <MdChecklist />
              </div>
              <h3>Shared Tasks</h3>
              <p className="category-description">To-dos for both of you</p>
              <div className="category-status">
                <span className="status-text">4 pending</span>
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
                  <p>Reservation confirmed ✓</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h2>Recent Activity</h2>
              <div className="activity-header">
                <MdDateRange className="activity-icon" />
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
                  <div className="stat-number">$450</div>
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upcoming Dates</h2>
              <button className="close-button" onClick={closeModal}>
                <MdClose />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="calendar-header">
                <h3>Your Events</h3>
                <button 
                  className="add-event-button"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <MdAdd /> Add Event
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

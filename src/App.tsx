import './App.css';
import { 
  MdDateRange, 
  MdPhotoLibrary, 
  MdFavorite, 
  MdNoteAlt, 
  MdAccountBalanceWallet, 
  MdEmojiEvents, 
  MdChecklist, 
  MdStar 
} from 'react-icons/md';
import { FaHeart } from 'react-icons/fa';

function App() {
  return (
    <div className="app">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image">
          <div className="hero-overlay">
            <div className="heart-icon">
              <FaHeart />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="title">i love c</h1>
            <div className="categories-link">
              <MdChecklist className="categories-icon" />
              <span>Categories</span>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="category-grid">
            {/* Large Cards */}
            <div className="category-card large">
              <div className="category-icon">
                <MdDateRange />
              </div>
              <h3>Upcoming Dates</h3>
              <p className="category-description">Events you're planning together - dinner, trips, movies</p>
              <div className="category-status">
                <span className="status-text">3 upcoming events</span>
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

            {/* Medium Cards */}
            <div className="category-card medium">
              <div className="category-icon">
                <MdFavorite />
              </div>
              <h3>Wishlist</h3>
              <p className="category-description">Restaurants, movies, places to visit</p>
              <div className="category-status">
                <span className="status-text">12 items</span>
              </div>
            </div>

            <div className="category-card medium">
              <div className="category-icon">
                <MdNoteAlt />
              </div>
              <h3>Notes & Journal</h3>
              <p className="category-description">Free-form pages like Notion blocks</p>
              <div className="category-status">
                <span className="status-text">8 entries</span>
              </div>
            </div>

            <div className="category-card medium">
              <div className="category-icon">
                <MdAccountBalanceWallet />
              </div>
              <h3>Budget Tracker</h3>
              <p className="category-description">Estimated vs actual expenses</p>
              <div className="category-status">
                <span className="status-text">$450 this month</span>
              </div>
            </div>

            {/* Small Cards */}
            <div className="category-card small">
              <div className="category-icon">
                <MdEmojiEvents />
              </div>
              <h3>Milestones</h3>
              <p className="category-description">Relationship highlights</p>
              <div className="category-status">
                <span className="status-text">5 milestones</span>
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

            <div className="category-card small">
              <div className="category-icon">
                <MdStar />
              </div>
              <h3>Favorites</h3>
              <p className="category-description">Songs, shows, foods you enjoy</p>
              <div className="category-status">
                <span className="status-text">18 favorites</span>
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
    </div>
  );
}

export default App;

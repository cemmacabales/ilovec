import './App.css';

function App() {
  return (
    <div className="app">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image">
          <div className="hero-overlay">
            <div className="heart-icon">♡</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="title">My Wedding Planner</h1>
            <div className="categories-link">
              <span className="categories-icon">📋</span>
              <span>Categories</span>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">🏛️</div>
              <h3>Venue</h3>
              <div className="category-status">
                <span className="status-icon">📍</span>
                <span>Venue Selection</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🍽️</div>
              <h3>Caterer</h3>
              <div className="category-status">
                <span className="status-icon">👨‍🍳</span>
                <span>Caterer</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Decoration</h3>
              <div className="category-status">
                <span className="status-icon">🎭</span>
                <span>Theme & Decor</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">👰</div>
              <h3>Bride Attire</h3>
              <div className="category-status">
                <span className="status-icon">👗</span>
                <span>Bride Attire</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">💄</div>
              <h3>Hair & Makeup</h3>
              <div className="category-status">
                <span className="status-icon">💅</span>
                <span>Hair and Makeup</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🤵</div>
              <h3>Groom Attire</h3>
              <div className="category-status">
                <span className="status-icon">👔</span>
                <span>Groom Attire</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🎵</div>
              <h3>Entertainment</h3>
              <div className="category-status">
                <span className="status-icon">🎤</span>
                <span>Entertainment</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">📸</div>
              <h3>Photography</h3>
              <div className="category-status">
                <span className="status-icon">📷</span>
                <span>Photography</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🖨️</div>
              <h3>Printables</h3>
              <div className="category-status">
                <span className="status-icon">📄</span>
                <span>Printables</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🎂</div>
              <h3>Cake</h3>
              <div className="category-status">
                <span className="status-icon">🧁</span>
                <span>Cake</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">🎁</div>
              <h3>Wedding Favor</h3>
              <div className="category-status">
                <span className="status-icon">🎀</span>
                <span>Wedding Favor</span>
              </div>
            </div>

            <div className="category-card">
              <div className="category-icon">📋</div>
              <h3>Others</h3>
              <div className="category-status">
                <span className="status-icon">📝</span>
                <span>Other</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Save the Date */}
            <div className="save-date-section">
              <h2>Save the Date</h2>
              <div className="save-date-card">
                <div className="date-display">
                  <div className="date-number">24</div>
                  <div className="date-month">NOV</div>
                  <div className="date-year">25</div>
                </div>
                <div className="date-details">
                  <p>Save the Date</p>
                  <p>Eva & Carl</p>
                  <p>Scarborough</p>
                </div>
              </div>
            </div>

            {/* Wedding Timeline */}
            <div className="timeline-section">
              <h2>Wedding Timeline</h2>
              <div className="timeline-header">
                <span className="timeline-icon">📅</span>
                <span>Wedding Timeline Overview</span>
              </div>
              
              <div className="timeline-items">
                <div className="timeline-item">
                  <div className="timeline-time">11:00 AM</div>
                  <div className="timeline-event">Bride's family</div>
                  <div className="timeline-location">Groom</div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-time">3:00 AM</div>
                  <div className="timeline-event">Groom</div>
                  <div className="timeline-location">Bride</div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-time">11:00 AM</div>
                  <div className="timeline-event">Bride's family</div>
                  <div className="timeline-location">Groom</div>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="welcome-section">
              <h2>Welcome</h2>
              <div className="welcome-card">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">👤</div>
                </div>
                <div className="welcome-details">
                  <h3>About Me</h3>
                  <p>ID Card</p>
                  <p>Today's Wednesday, January 17th 2024 3:44 PM</p>
                  <p>Have a nice day!</p>
                  <p>🎂 Birthday: October 06, 1996</p>
                  <p>📧 Gina</p>
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

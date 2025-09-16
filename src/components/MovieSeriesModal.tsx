import React, { useState, useEffect } from 'react';
import { MdClose, MdSearch, MdAdd, MdStar, MdPlayArrow, MdCheck, MdRemove } from 'react-icons/md';
import { FaFilm, FaTv } from 'react-icons/fa';
import tmdbService from '../services/tmdb';
import { useWatchlist } from '../contexts/WatchlistContext';
import type { TMDBMovie, TMDBTVShow, TMDBSearchResponse } from '../types/tmdb';

interface MovieSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaType = 'movie' | 'tv' | 'all';
type TabType = 'search' | 'watchlist' | 'watching' | 'completed';

const MovieSeriesModal: React.FC<MovieSeriesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularItems, setPopularItems] = useState<(TMDBMovie | TMDBTVShow)[]>([]);

  const { 
    state: watchlistState, 
    addToWatchlist, 
    removeFromWatchlist, 
    updateItem,
    isInWatchlist,
    getItemsByStatus,
    getItemByTmdbId
  } = useWatchlist();

  // Load popular items when modal opens
  useEffect(() => {
    if (isOpen && searchResults.length === 0 && !searchQuery) {
      loadPopularItems();
    }
  }, [isOpen]);

  const loadPopularItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [popularMovies, popularTVShows] = await Promise.all([
        tmdbService.getPopularMovies(),
        tmdbService.getPopularTVShows()
      ]);
      
      // Mix movies and TV shows
      const mixed = [];
      const maxItems = Math.max(popularMovies.results.length, popularTVShows.results.length);
      
      for (let i = 0; i < maxItems && mixed.length < 20; i++) {
        if (i < popularMovies.results.length) mixed.push(popularMovies.results[i]);
        if (i < popularTVShows.results.length) mixed.push(popularTVShows.results[i]);
      }
      
      setPopularItems(mixed);
    } catch (err) {
      setError('Failed to load popular items');
      console.error('Error loading popular items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      loadPopularItems();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let response: TMDBSearchResponse<TMDBMovie | TMDBTVShow>;
      
      if (mediaType === 'movie') {
        response = await tmdbService.searchMovies(searchQuery);
      } else if (mediaType === 'tv') {
        response = await tmdbService.searchTVShows(searchQuery);
      } else {
        response = await tmdbService.searchMulti(searchQuery);
      }
      
      setSearchResults(response.results);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (item: TMDBMovie | TMDBTVShow) => {
    const isMovie = 'title' in item;
    const title = isMovie ? item.title : item.name;
    
    addToWatchlist({
      tmdbId: item.id,
      type: isMovie ? 'movie' : 'tv',
      title,
      poster_path: item.poster_path,
      status: 'watchlist'
    });
  };

  const handleRemoveFromWatchlist = (item: TMDBMovie | TMDBTVShow) => {
    const isMovie = 'title' in item;
    const existingItem = getItemByTmdbId(item.id, isMovie ? 'movie' : 'tv');
    if (existingItem) {
      removeFromWatchlist(existingItem.id);
    }
  };

  const handleStatusChange = (item: TMDBMovie | TMDBTVShow, newStatus: 'watchlist' | 'watching' | 'completed') => {
    const isMovie = 'title' in item;
    const existingItem = getItemByTmdbId(item.id, isMovie ? 'movie' : 'tv');
    
    if (existingItem) {
      updateItem(existingItem.id, { 
        status: newStatus,
        dateWatched: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    }
  };

  const renderMediaItem = (item: TMDBMovie | TMDBTVShow) => {
    const isMovie = 'title' in item;
    const title = isMovie ? item.title : item.name;
    const releaseDate = isMovie ? item.release_date : item.first_air_date;
    const year = releaseDate ? tmdbService.getYear(releaseDate) : 'Unknown';
    const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w342');
    const inWatchlist = isInWatchlist(item.id, isMovie ? 'movie' : 'tv');
    const existingItem = getItemByTmdbId(item.id, isMovie ? 'movie' : 'tv');

    return (
      <div key={`${isMovie ? 'movie' : 'tv'}-${item.id}`} className="media-item">
        <div className="media-poster">
          {posterUrl ? (
            <img src={posterUrl} alt={title} />
          ) : (
            <div className="poster-placeholder">
              {isMovie ? <FaFilm /> : <FaTv />}
            </div>
          )}
          <div className="media-type-badge">
            {isMovie ? <FaFilm /> : <FaTv />}
          </div>
        </div>
        
        <div className="media-info">
          <h4 className="media-title">{title}</h4>
          <p className="media-year">{year}</p>
          <div className="media-rating">
            <MdStar className="star-icon" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
          
          <div className="media-actions">
            {!inWatchlist ? (
              <button 
                className="action-btn add-btn"
                onClick={() => handleAddToWatchlist(item)}
              >
                <MdAdd /> Add to Watchlist
              </button>
            ) : (
              <div className="status-controls">
                <select
                  value={existingItem?.status || 'watchlist'}
                  onChange={(e) => handleStatusChange(item, e.target.value as any)}
                  className="status-select"
                >
                  <option value="watchlist">Watchlist</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                </select>
                <button 
                  className="action-btn remove-btn"
                  onClick={() => handleRemoveFromWatchlist(item)}
                >
                  <MdRemove />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWatchlistItems = (status: 'watchlist' | 'watching' | 'completed') => {
    const items = getItemsByStatus(status);
    
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <p>No items in {status} yet.</p>
        </div>
      );
    }

    return (
      <div className="watchlist-grid">
        {items.map(item => (
          <div key={item.id} className="watchlist-item">
            <div className="media-poster">
              {item.poster_path ? (
                <img src={tmdbService.getImageUrl(item.poster_path, 'w342')!} alt={item.title} />
              ) : (
                <div className="poster-placeholder">
                  {item.type === 'movie' ? <FaFilm /> : <FaTv />}
                </div>
              )}
              <div className="media-type-badge">
                {item.type === 'movie' ? <FaFilm /> : <FaTv />}
              </div>
            </div>
            
            <div className="media-info">
              <h4 className="media-title">{item.title}</h4>
              {item.progress && item.type === 'tv' && (
                <p className="progress-info">
                  S{item.progress.currentSeason}E{item.progress.currentEpisode}
                </p>
              )}
              
              <div className="media-actions">
                <select
                  value={item.status}
                  onChange={(e) => updateItem(item.id, { 
                    status: e.target.value as any,
                    dateWatched: e.target.value === 'completed' ? new Date().toISOString() : undefined
                  })}
                  className="status-select"
                >
                  <option value="watchlist">Watchlist</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                </select>
                <button 
                  className="action-btn remove-btn"
                  onClick={() => removeFromWatchlist(item.id)}
                >
                  <MdRemove />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const displayItems = searchQuery ? searchResults : popularItems;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content movie-series-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Movie & Series Tracker</h2>
          <button className="close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <MdSearch /> Search
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <MdAdd /> Watchlist ({getItemsByStatus('watchlist').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watching' ? 'active' : ''}`}
            onClick={() => setActiveTab('watching')}
          >
            <MdPlayArrow /> Watching ({getItemsByStatus('watching').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <MdCheck /> Completed ({getItemsByStatus('completed').length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'search' && (
            <>
              <div className="search-controls">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search movies and TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button onClick={handleSearch} disabled={loading}>
                    <MdSearch />
                  </button>
                </div>
                
                <div className="media-type-filter">
                  <button 
                    className={`filter-btn ${mediaType === 'all' ? 'active' : ''}`}
                    onClick={() => setMediaType('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn ${mediaType === 'movie' ? 'active' : ''}`}
                    onClick={() => setMediaType('movie')}
                  >
                    <FaFilm /> Movies
                  </button>
                  <button 
                    className={`filter-btn ${mediaType === 'tv' ? 'active' : ''}`}
                    onClick={() => setMediaType('tv')}
                  >
                    <FaTv /> TV Shows
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              
              {loading ? (
                <div className="loading-state">Loading...</div>
              ) : (
                <div className="media-grid">
                  {displayItems.map(renderMediaItem)}
                </div>
              )}
            </>
          )}

          {activeTab === 'watchlist' && renderWatchlistItems('watchlist')}
          {activeTab === 'watching' && renderWatchlistItems('watching')}
          {activeTab === 'completed' && renderWatchlistItems('completed')}
        </div>
      </div>
    </div>
  );
};

export default MovieSeriesModal;
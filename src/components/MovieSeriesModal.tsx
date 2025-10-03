import React, { useState, useEffect } from 'react';
import { MdClose, MdSearch, MdAdd, MdStar, MdPlayArrow, MdCheck, MdRemove, MdAssignment } from 'react-icons/md';
import { FaFilm, FaTv } from 'react-icons/fa';
import tmdbService from '../services/tmdb';
import { addMovieSeries, fetchMovieSeries, updateMovieSeries, removeMovieSeries } from '../services/supabase';
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

  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);

  // Fetch watchlist items from Supabase on mount
  useEffect(() => {
    (async () => {
      const { data } = await fetchMovieSeries();
      setWatchlistItems(data || []);
    })();
  }, [isOpen]);

  const getItemsByStatus = (status: string) => watchlistItems.filter(item => item.status === status);
  const getItemByTmdbId = (tmdbId: number, type: string) => watchlistItems.find(item => item.tmdb_id === tmdbId && item.type === type);
  const isInWatchlist = (tmdbId: number, type: string) => !!getItemByTmdbId(tmdbId, type);

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

  const handleAddToWatchlist = async (item: TMDBMovie | TMDBTVShow) => {
    const isMovie = 'title' in item;
    const title = isMovie ? (item.title || 'Unknown Title') : (item.name || 'Unknown Title');
    await addMovieSeries({
      tmdbId: item.id,
      type: isMovie ? 'movie' : 'tv',
      title,
      poster_path: item.poster_path ?? undefined,
      status: 'watchlist'
    });
    const { data } = await fetchMovieSeries();
    setWatchlistItems(data || []);
  };

  const handleRemoveFromWatchlist = async (item: any) => {
    // Always resolve the Supabase item for deletion
    let supabaseItem = item;
    if (!item.id && item.tmdb_id) {
      // Refetch latest watchlistItems before resolving
      const { data } = await fetchMovieSeries();
      setWatchlistItems(data || []);
      supabaseItem = (data || []).find(
        (i: any) => i.tmdb_id === item.tmdb_id && i.type === item.type
      );
    } else if (!item.id && item.id && item.title) {
      const { data } = await fetchMovieSeries();
      setWatchlistItems(data || []);
      supabaseItem = (data || []).find(
        (i: any) => i.tmdb_id === item.id && i.type === ('title' in item ? 'movie' : 'tv')
      );
    }
    if (!supabaseItem || !supabaseItem.id) {
      alert('Could not find item in Supabase to delete.');
      return;
    }
    try {
      console.log('Deleting Supabase item id:', supabaseItem.id);
      const { error } = await removeMovieSeries(supabaseItem.id);
      if (error) {
        alert('Failed to delete: ' + error.message);
        return;
      }
      const { data } = await fetchMovieSeries();
      setWatchlistItems(data || []);
    } catch (err) {
      alert('Unexpected error during delete: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleStatusChange = async (item: any, newStatus: 'watchlist' | 'watching' | 'completed') => {
    // Always resolve the Supabase item for updates
    let supabaseItem = item;
    if (!item.id && item.tmdb_id) {
      supabaseItem = getItemByTmdbId(item.tmdb_id, item.type);
    } else if (!item.id && item.id && item.title) {
      supabaseItem = getItemByTmdbId(item.id, 'title' in item ? 'movie' : 'tv');
    }
    if (supabaseItem && supabaseItem.id) {
      const { error } = await updateMovieSeries(supabaseItem.id, { 
        status: newStatus,
        notes: supabaseItem.poster_path || supabaseItem.notes || ''
      });
      if (error) {
        alert('Failed to update status: ' + error.message);
        return;
      }
      const { data } = await fetchMovieSeries();
      setWatchlistItems(data || []);
    }
  };

  // Track "added" state for each search result at the component level
  const [addedMap, setAddedMap] = useState<{ [id: number]: boolean }>({});

  const handleAddWithEffect = async (item: TMDBMovie | TMDBTVShow) => {
    await handleAddToWatchlist(item);
    setAddedMap(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const renderMediaItem = (item: TMDBMovie | TMDBTVShow) => {
    const isMovie = 'title' in item;
    const title = isMovie ? (item.title || 'Unknown Title') : (item.name || 'Unknown Title');
    const releaseDate = isMovie ? item.release_date : item.first_air_date;
    const year = releaseDate ? tmdbService.getYear(releaseDate) : 'Unknown';
    const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w342');
    const inWatchlist = isInWatchlist(item.id, isMovie ? 'movie' : 'tv');
    const added = !!addedMap[item.id];

    return (
      <div key={`${isMovie ? 'movie' : 'tv'}-${item.id}`} className={`media-item${added ? ' added-effect' : ''}`}>
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
            <span>{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          
          <div className="media-actions">
            {!inWatchlist ? (
              <button 
                className={`action-btn add-btn${added ? ' added-btn' : ''}`}
                onClick={() => handleAddWithEffect(item)}
                disabled={added}
                style={added ? { background: '#4caf50', color: '#fff', transform: 'scale(1.08)', transition: 'all 0.3s' } : {}}
              >
{added ? (
  <span className="added-btn">
    <MdCheck style={{ marginRight: 10, fontSize: '1.6em', color: '#fff' }} />
    Added to Watchlist
  </span>
) : (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <MdAdd style={{ marginRight: 8, fontSize: '1.2em' }} />
                    Add to Watchlist
                  </span>
                )}
              </button>
            ) : (
              <span className="added-label">Added to Watchlist</span>
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
              {item.poster_path || item.notes ? (
                <img src={tmdbService.getImageUrl(item.poster_path || item.notes, 'w342')!} alt={item.title} />
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
              <div className="media-actions">
                <select
                  value={item.status}
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
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const displayItems = searchQuery ? searchResults : popularItems;

  const watchlistCount = getItemsByStatus('watchlist').length;
  const watchingCount = getItemsByStatus('watching').length;
  const completedCount = getItemsByStatus('completed').length;
  const totalCount = watchlistCount + watchingCount + completedCount;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="shared-tasks-modal modal-content movie-series-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2>Movie & Series Tracker</h2>
            <div className="task-stats">
              <span className="stat-item">
                <MdAssignment /> {totalCount} total
              </span>
              <span className="stat-item">
                <MdAdd /> {watchlistCount} watchlist
              </span>
              <span className="stat-item pending">
                <MdPlayArrow /> {watchingCount} watching
              </span>
              <span className="stat-item completed">
                <MdCheck /> {completedCount} completed
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
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
              <div className="tasks-controls">
                <div className="search-filter-row">
                  <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search movies and TV shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  
                  <div className="filter-controls">
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
                        Movies
                      </button>
                      <button 
                        className={`filter-btn ${mediaType === 'tv' ? 'active' : ''}`}
                        onClick={() => setMediaType('tv')}
                      >
                        TV Shows
                      </button>
                    </div>
                  </div>

                  <div className="view-actions">
                    <button 
                      className="add-task-btn"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      <MdSearch /> Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="tasks-container">
                {error && <div className="error-message">{error}</div>}
                
                {loading ? (
                  <div className="loading-state">Loading...</div>
                ) : (
                  <>
                    {displayItems.length === 0 ? (
                      <div className="empty-state">
                        <p>No results. Try another search.</p>
                      </div>
                    ) : (
                      <div className="media-grid">
                        {displayItems.filter(item => item && item.id).map(renderMediaItem)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'watchlist' && (
            <div className="tasks-container">
              {renderWatchlistItems('watchlist')}
            </div>
          )}
          {activeTab === 'watching' && (
            <div className="tasks-container">
              {renderWatchlistItems('watching')}
            </div>
          )}
          {activeTab === 'completed' && (
            <div className="tasks-container">
              {renderWatchlistItems('completed')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieSeriesModal;

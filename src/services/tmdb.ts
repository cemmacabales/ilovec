import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBSearchResponse,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBGenre
} from '../types/tmdb';

// You'll need to set your TMDB API key here
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_api_key_here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBService {
  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('TMDB API fetch error:', error);
      throw error;
    }
  }

  // Search for movies and TV shows
  async searchMulti(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Search specifically for movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
    const endpoint = `/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Search specifically for TV shows
  async searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
    const endpoint = `/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const endpoint = `/movie/${movieId}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get TV show details
  async getTVShowDetails(tvId: number): Promise<TMDBTVShowDetails> {
    const endpoint = `/tv/${tvId}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
    const endpoint = `/movie/popular?page=${page}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get popular TV shows
  async getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
    const endpoint = `/tv/popular?page=${page}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get trending movies and TV shows
  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
    const endpoint = `/trending/${mediaType}/${timeWindow}`;
    return this.fetchFromTMDB(endpoint);
  }

  // Get movie genres
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    const endpoint = '/genre/movie/list';
    return this.fetchFromTMDB(endpoint);
  }

  // Get TV genres
  async getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
    const endpoint = '/genre/tv/list';
    return this.fetchFromTMDB(endpoint);
  }

  // Discover movies with filters
  async discoverMovies(params: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: string;
    minRating?: number;
  } = {}): Promise<TMDBSearchResponse<TMDBMovie>> {
    const {
      page = 1,
      genre,
      year,
      sortBy = 'popularity.desc',
      minRating
    } = params;

    let endpoint = `/discover/movie?page=${page}&sort_by=${sortBy}`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&year=${year}`;
    if (minRating) endpoint += `&vote_average.gte=${minRating}`;

    return this.fetchFromTMDB(endpoint);
  }

  // Discover TV shows with filters
  async discoverTVShows(params: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: string;
    minRating?: number;
  } = {}): Promise<TMDBSearchResponse<TMDBTVShow>> {
    const {
      page = 1,
      genre,
      year,
      sortBy = 'popularity.desc',
      minRating
    } = params;

    let endpoint = `/discover/tv?page=${page}&sort_by=${sortBy}`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&first_air_date_year=${year}`;
    if (minRating) endpoint += `&vote_average.gte=${minRating}`;

    return this.fetchFromTMDB(endpoint);
  }

  // Utility functions for image URLs
  getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Format runtime from minutes to hours and minutes
  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    }
    
    return remainingMinutes === 0 
      ? `${hours}h` 
      : `${hours}h ${remainingMinutes}m`;
  }

  // Format release date
  formatReleaseDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get year from date string
  getYear(dateString: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).getFullYear().toString();
  }
}

// Export a singleton instance
export const tmdbService = new TMDBService();
export default tmdbService;
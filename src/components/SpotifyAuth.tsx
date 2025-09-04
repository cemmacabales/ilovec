import React, { useState, useEffect } from 'react';
import { MdMusicNote, MdLogin, MdLogout } from 'react-icons/md';

interface SpotifyAuthProps {
  onTokenChange: (token: string | null) => void;
}

const SpotifyAuth: React.FC<SpotifyAuthProps> = ({ onTokenChange }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Spotify Web API credentials (these should be environment variables in production)
  const CLIENT_ID = 'your_spotify_client_id'; // Replace with your Spotify app client ID
  const REDIRECT_URI = window.location.origin;
  const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ].join(' ');

  useEffect(() => {
    // Check for token in URL hash (after redirect from Spotify)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        onTokenChange(accessToken);
        // Store token in localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        // Clear the hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // Check for stored token
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setToken(storedToken);
        onTokenChange(storedToken);
      }
    }
  }, [onTokenChange]);

  const login = () => {
    setIsLoading(true);
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=token&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `show_dialog=true`;
    
    window.location.href = authUrl;
  };

  const logout = () => {
    setToken(null);
    onTokenChange(null);
    localStorage.removeItem('spotify_access_token');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Connecting to Spotify...</span>
      </div>
    );
  }

  return (
    <div className="spotify-auth">
      {token ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-600">
            <MdMusicNote className="text-xl" />
            <span className="text-sm font-medium">Connected to Spotify</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <MdLogout className="text-lg" />
            <span>Disconnect</span>
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
        >
          <MdLogin className="text-lg" />
          <span>Connect to Spotify</span>
        </button>
      )}
    </div>
  );
};

export default SpotifyAuth;
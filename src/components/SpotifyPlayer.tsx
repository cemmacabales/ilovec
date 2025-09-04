import React, { useState, useEffect, useRef } from 'react';
import { MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious, MdVolumeUp, MdVolumeDown, MdVolumeMute } from 'react-icons/md';

interface PlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: Spotify.Track;
    previous_tracks: Spotify.Track[];
    next_tracks: Spotify.Track[];
  };
}

interface SpotifyPlayerProps {
  token: string | null;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ token }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [isReady, setIsReady] = useState<boolean>(false);
  const playerRef = useRef<Spotify.Player | null>(null);

  useEffect(() => {
    if (!token) return;

    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'iLoveC Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: volume
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Spotify Player initialization error:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Spotify Player authentication error:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Spotify Player account error:', message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Spotify Player playback error:', message);
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (state) {
          setPlayerState(state);
        }
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready with Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify Player not ready with Device ID:', device_id);
        setIsReady(false);
      });

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, volume]);

  const togglePlay = async () => {
    if (!player) return;
    
    try {
      await player.togglePlay();
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const previousTrack = async () => {
    if (!player) return;
    
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  };

  const nextTrack = async () => {
    if (!player) return;
    
    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error going to next track:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!player) return;
    
    try {
      await player.setVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!token) {
    return (
      <div className="spotify-player bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600 text-center">Please connect to Spotify to use the music player</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="spotify-player bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="text-gray-600">Initializing Spotify Player...</p>
        </div>
      </div>
    );
  }

  const currentTrack = playerState?.track_window?.current_track;
  const isPlaying = playerState && !playerState.paused;

  return (
    <div className="spotify-player bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      {/* Track Info */}
      {currentTrack && (
        <div className="track-info mb-4">
          <div className="flex items-center space-x-4">
            {currentTrack.album.images[0] && (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                className="w-16 h-16 rounded-lg shadow-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{currentTrack.name}</h3>
              <p className="text-gray-600 text-sm truncate">
                {currentTrack.artists.map(artist => artist.name).join(', ')}
              </p>
              <p className="text-gray-500 text-xs truncate">{currentTrack.album.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {playerState && (
        <div className="progress-bar mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{formatTime(playerState.position)}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                style={{
                  width: `${(playerState.position / playerState.duration) * 100}%`
                }}
              ></div>
            </div>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="playback-controls mb-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={previousTrack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={!playerState?.track_window?.previous_tracks?.length}
          >
            <MdSkipPrevious className="text-2xl" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <MdPause className="text-2xl" />
            ) : (
              <MdPlayArrow className="text-2xl" />
            )}
          </button>
          
          <button
            onClick={nextTrack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={!playerState?.track_window?.next_tracks?.length}
          >
            <MdSkipNext className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <div className="flex items-center space-x-2">
          <MdVolumeMute className="text-gray-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <MdVolumeUp className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
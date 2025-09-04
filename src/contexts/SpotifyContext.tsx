import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SpotifyContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  player: Spotify.Player | null;
  setPlayer: (player: Spotify.Player | null) => void;
  playerState: Spotify.PlaybackState | null;
  setPlayerState: (state: Spotify.PlaybackState | null) => void;
  deviceId: string;
  setDeviceId: (id: string) => void;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  // Player control methods
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekToPosition: (position: number) => Promise<void>;
  changeVolume: (volume: number) => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

interface SpotifyProviderProps {
  children: ReactNode;
}

export const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  // Derived state
  const isPlaying = playerState ? !playerState.paused : false;
  const currentTrack = playerState?.track_window?.current_track || null;

  // Player control methods
  const togglePlay = async (): Promise<void> => {
    if (!player) return;
    try {
      await player.togglePlay();
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const nextTrack = async (): Promise<void> => {
    if (!player) return;
    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error going to next track:', error);
    }
  };

  const previousTrack = async (): Promise<void> => {
    if (!player) return;
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  };

  const seekToPosition = async (position: number): Promise<void> => {
    if (!player) return;
    try {
      await player.seek(position);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  };

  const changeVolume = async (newVolume: number): Promise<void> => {
    if (!player) return;
    try {
      await player.setVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Initialize Spotify Web Playback SDK when token is available
  useEffect(() => {
    if (!token) {
      setPlayer(null);
      setPlayerState(null);
      setDeviceId('');
      setIsReady(false);
      return;
    }

    // Check if SDK is already loaded
    if (window.Spotify) {
      initializePlayer();
    } else {
      // Load Spotify Web Playback SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    }

    function initializePlayer() {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'iLoveC Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token!);
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
    }

    // Cleanup function
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token, volume]);

  const contextValue: SpotifyContextType = {
    token,
    setToken,
    player,
    setPlayer,
    playerState,
    setPlayerState,
    deviceId,
    setDeviceId,
    isReady,
    setIsReady,
    volume,
    setVolume,
    isPlaying,
    currentTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    seekToPosition,
    changeVolume
  };

  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = (): SpotifyContextType => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

export default SpotifyContext;
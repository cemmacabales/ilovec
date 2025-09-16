import React, { useState } from 'react';
import { MdClose, MdMusicNote, MdPlaylistPlay, MdFavorite } from 'react-icons/md';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MusicModal: React.FC<MusicModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content music-modal ${isClosing ? 'modal-content-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="music-header-left">
            <h2>
              <MdMusicNote style={{ marginRight: '8px' }} />
              Our Music Playlist
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b6358', fontSize: '14px' }}>
              Our shared soundtrack and favorite songs
            </p>
          </div>
          <button className="close-button" onClick={handleClose}>
            <MdClose />
          </button>
        </div>
        
        <div className="modal-body music-body">
          <div className="music-description">
            <div className="music-intro">
              <MdPlaylistPlay style={{ fontSize: '24px', color: '#d4a574', marginRight: '8px' }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>Couple's Playlist</h3>
                <p style={{ margin: 0, color: '#6b6358', fontSize: '14px' }}>
                  Songs that remind us of each other and our special moments together
                </p>
              </div>
            </div>
          </div>

          <div className="apple-music-container">
            <iframe 
              allow="autoplay *; encrypted-media *;" 
              frameBorder="0" 
              height="450" 
              style={{
                width: '100%',
                maxWidth: '660px',
                overflow: 'hidden',
                background: 'transparent',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
              src="https://embed.music.apple.com/ph/playlist/mylove/pl.u-pMylgvLtW7RGMk5"
              title="Apple Music Playlist"
            />
          </div>

          <div className="music-features">
            <div className="feature-card">
              <MdFavorite style={{ color: '#e74c3c', fontSize: '20px' }} />
              <div>
                <h4>Favorite Songs</h4>
                <p>Songs that hold special meaning for us</p>
              </div>
            </div>
            <div className="feature-card">
              <MdPlaylistPlay style={{ color: '#3498db', fontSize: '20px' }} />
              <div>
                <h4>Shared Playlists</h4>
                <p>Collaborative playlists we create together</p>
              </div>
            </div>
          </div>

          <div className="music-note">
            <p style={{ 
              textAlign: 'center', 
              color: '#6b6358', 
              fontSize: '13px', 
              fontStyle: 'italic',
              margin: '16px 0 0 0'
            }}>
              💝 "mylove" - Your shared playlist is now ready to play!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicModal;
import React, { useState, useRef, useEffect } from 'react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdDelete,
  MdFavorite,
  MdFavoriteBorder,
  MdPhotoLibrary,
  MdFolder,
  MdSearch,
  MdUpload,
  MdArrowBack,
  MdArrowForward,
  MdGridView,
  MdViewList
} from 'react-icons/md';

export interface Image {
  id: string;
  url: string;
  title: string;
  description?: string;
  albumId?: string;
  isFavorite: boolean;
  dateAdded: string;
  tags: string[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string;
  isFavorite: boolean;
  dateCreated: string;
  imageCount: number;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<Image[]>([
    {
      id: '1',
      url: '/assets/mendmygirl.jpeg',
      title: 'Beach Sunset',
      description: 'Beautiful sunset at the beach',
      albumId: 'album1',
      isFavorite: true,
      dateAdded: '2025-01-15',
      tags: ['sunset', 'beach', 'romantic']
    },
    {
      id: '2',
      url: '/assets/mendmygirl.jpeg',
      title: 'City Lights',
      description: 'Downtown at night',
      albumId: 'album1',
      isFavorite: false,
      dateAdded: '2025-01-10',
      tags: ['city', 'night', 'lights']
    },
    {
      id: '3',
      url: '/assets/mendmygirl.jpeg',
      title: 'Mountain View',
      description: 'Hiking adventure',
      albumId: 'album2',
      isFavorite: true,
      dateAdded: '2025-01-05',
      tags: ['mountain', 'hiking', 'nature']
    },
    {
      id: '4',
      url: '/assets/mendmygirl.jpeg',
      title: 'Candlelight Dinner',
      description: 'Romantic dinner at our favorite restaurant',
      albumId: 'album1',
      isFavorite: true,
      dateAdded: '2025-01-20',
      tags: ['dinner', 'romantic', 'candles', 'date']
    }
  ]);

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: 'album1',
      name: 'Date Nights',
      description: 'Our romantic evenings together',
      coverImageId: '1',
      isFavorite: true,
      dateCreated: '2025-01-01',
      imageCount: 3
    },
    {
      id: 'album2',
      name: 'Adventures',
      description: 'Our outdoor activities',
      coverImageId: '3',
      isFavorite: false,
      dateCreated: '2025-01-02',
      imageCount: 1
    }
  ]);

  const [currentView, setCurrentView] = useState<'albums' | 'images' | 'favorites'>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isImageViewerClosing, setIsImageViewerClosing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAlbumForm, setShowAddAlbumForm] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    albumId: '',
    tags: ''
  });

  const [newAlbum, setNewAlbum] = useState({
    name: '',
    description: ''
  });

  const handleClose = () => {
    // If image viewer is open, close it instead of the gallery modal
    if (isImageViewerOpen) {
      closeImageViewer();
      return;
    }
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentView('albums');
      setSelectedAlbum(null);
      setSelectedImage(null);
      setShowAddForm(false);
      setShowAddAlbumForm(false);
      setEditingImage(null);
      setEditingAlbum(null);
    }, 200);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageData: Image = {
            id: Date.now().toString() + Math.random(),
            url: e.target?.result as string,
            title: newImage.title || file.name,
            description: newImage.description,
            albumId: newImage.albumId,
            isFavorite: false,
            dateAdded: new Date().toISOString().slice(0, 10),
            tags: newImage.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          };
          setImages(prev => [...prev, newImageData]);
          
          // Update album image count
          if (newImage.albumId) {
            setAlbums(prev => prev.map(album => 
              album.id === newImage.albumId 
                ? { ...album, imageCount: album.imageCount + 1 }
                : album
            ));
          }
        };
        reader.readAsDataURL(file);
      });
      setShowAddForm(false);
      setNewImage({ title: '', description: '', albumId: '', tags: '' });
    }
  };

  const handleAddAlbum = () => {
    if (newAlbum.name) {
      const album: Album = {
        id: Date.now().toString(),
        name: newAlbum.name,
        description: newAlbum.description,
        isFavorite: false,
        dateCreated: new Date().toISOString().slice(0, 10),
        imageCount: 0
      };
      setAlbums(prev => [...prev, album]);
      setNewAlbum({ name: '', description: '' });
      setShowAddAlbumForm(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    // Update album image count
    if (image?.albumId) {
      setAlbums(prev => prev.map(album => 
        album.id === image.albumId 
          ? { ...album, imageCount: Math.max(0, album.imageCount - 1) }
          : album
      ));
    }
  };

  const handleDeleteAlbum = (albumId: string) => {
    setAlbums(prev => prev.filter(album => album.id !== albumId));
    // Remove album reference from images
    setImages(prev => prev.map(img => 
      img.albumId === albumId ? { ...img, albumId: undefined } : img
    ));
  };

  const toggleImageFavorite = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    ));
  };

  const toggleAlbumFavorite = (albumId: string) => {
    setAlbums(prev => prev.map(album => 
      album.id === albumId ? { ...album, isFavorite: !album.isFavorite } : album
    ));
  };

  const handleEditImage = (image: Image) => {
    setEditingImage(image);
    setNewImage({
      title: image.title,
      description: image.description || '',
      albumId: image.albumId || '',
      tags: image.tags.join(', ')
    });
  };

  const handleUpdateImage = () => {
    if (editingImage) {
      setImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? {
              ...img,
              title: newImage.title,
              description: newImage.description,
              albumId: newImage.albumId || undefined,
              tags: newImage.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            }
          : img
      ));
      setEditingImage(null);
      setNewImage({ title: '', description: '', albumId: '', tags: '' });
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setNewAlbum({
      name: album.name,
      description: album.description || ''
    });
  };

  const handleUpdateAlbum = () => {
    if (editingAlbum) {
      setAlbums(prev => prev.map(album => 
        album.id === editingAlbum.id 
          ? {
              ...album,
              name: newAlbum.name,
              description: newAlbum.description
            }
          : album
      ));
      setEditingAlbum(null);
      setNewAlbum({ name: '', description: '' });
    }
  };

  const getFilteredImages = () => {
    let filtered = images;
    
    if (currentView === 'favorites') {
      filtered = images.filter(img => img.isFavorite);
    } else if (selectedAlbum) {
      filtered = images.filter(img => img.albumId === selectedAlbum);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getFilteredAlbums = () => {
    let filtered = albums;
    
    if (currentView === 'favorites') {
      filtered = albums.filter(album => album.isFavorite);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(album => 
        album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerClosing(true);
    setTimeout(() => {
      setIsImageViewerOpen(false);
      setIsImageViewerClosing(false);
      setSelectedImage(null);
    }, 300); // Wait for exit animation to complete
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return;
      
      if (e.key === 'Escape') {
        closeImageViewer();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isImageViewerOpen]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content gallery-modal ${isClosing ? 'modal-content-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="gallery-header-left">
            <h2>
              {currentView === 'favorites' ? 'Favorites' : 
               selectedAlbum ? albums.find(a => a.id === selectedAlbum)?.name : 'Gallery'}
            </h2>
            {selectedAlbum && (
              <button 
                className="back-button"
                onClick={() => {
                  setSelectedAlbum(null);
                  setCurrentView('albums');
                }}
              >
                <MdArrowBack /> Back to Albums
              </button>
            )}
          </div>
          <div className="gallery-header-right">
            <div className="view-controls">
              <button 
                className={`view-btn ${currentView === 'albums' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('albums');
                  setSelectedAlbum(null);
                }}
              >
                <MdFolder /> Albums
              </button>
              <button 
                className={`view-btn ${currentView === 'images' ? 'active' : ''}`}
                onClick={() => setCurrentView('images')}
              >
                <MdPhotoLibrary /> All Images
              </button>
              <button 
                className={`view-btn ${currentView === 'favorites' ? 'active' : ''}`}
                onClick={() => setCurrentView('favorites')}
              >
                <MdFavorite /> Favorites
              </button>
            </div>
            <button className="close-button" onClick={handleClose}>
              <MdClose />
            </button>
          </div>
        </div>
        
        <div className="modal-body gallery-body">
          <div className="gallery-controls">
            <div className="search-bar">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${currentView === 'albums' || (!selectedAlbum && currentView !== 'images') ? 'albums' : 'images'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="gallery-actions">
              <div className="view-mode-toggle">
                <button 
                  className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <MdGridView />
                </button>
                <button 
                  className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <MdViewList />
                </button>
              </div>
              
              {(currentView === 'albums' || (!selectedAlbum && currentView !== 'images')) ? (
                <button className="add-btn" onClick={() => setShowAddAlbumForm(true)}>
                  <MdAdd /> Add Album
                </button>
              ) : (
                <button className="add-btn" onClick={() => setShowAddForm(true)}>
                  <MdAdd /> Add Images
                </button>
              )}
            </div>
          </div>

          {/* Albums View */}
          {(currentView === 'albums' || (currentView === 'favorites' && !selectedAlbum)) && !selectedAlbum && (
            <div className={`albums-container ${viewMode}`}>
              {getFilteredAlbums().map(album => (
                <div key={album.id} className="album-card">
                  <div className="album-cover" onClick={() => {
                    setSelectedAlbum(album.id);
                    setCurrentView('images');
                  }}>
                    {album.coverImageId ? (
                      <img 
                        src={images.find(img => img.id === album.coverImageId)?.url} 
                        alt={album.name}
                      />
                    ) : (
                      <div className="empty-album">
                        <MdPhotoLibrary />
                      </div>
                    )}
                    <div className="album-overlay">
                      <span className="image-count">{album.imageCount} images</span>
                    </div>
                  </div>
                  <div className="album-info">
                    <h3>{album.name}</h3>
                    {album.description && <p>{album.description}</p>}
                    <div className="album-actions">
                      <button 
                        className="favorite-btn"
                        onClick={() => toggleAlbumFavorite(album.id)}
                      >
                        {album.isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditAlbum(album)}
                      >
                        <MdEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAlbum(album.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Images View */}
          {(currentView === 'images' || selectedAlbum || (currentView === 'favorites' && selectedAlbum)) && (
            <div className={`images-container ${viewMode}`}>
              {getFilteredImages().map(image => (
                <div key={image.id} className="image-card">
                  <div className="image-wrapper" onClick={() => handleImageClick(image)}>
                    <img src={image.url} alt={image.title} />
                    <div className="image-overlay">
                      <div className="image-actions">
                        <button 
                          className="favorite-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageFavorite(image.id);
                          }}
                        >
                          {image.isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditImage(image);
                          }}
                        >
                          <MdEdit />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="image-info">
                    <h4>{image.title}</h4>
                    {image.description && <p>{image.description}</p>}
                    {image.tags.length > 0 && (
                      <div className="image-tags">
                        {image.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Image Form */}
          {showAddForm && (
            <div className="form-overlay">
              <div className="form-content">
                <h3>{editingImage ? 'Edit Image' : 'Add New Images'}</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newImage.title}
                    onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                    placeholder="Image title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newImage.description}
                    onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                    placeholder="Image description"
                  />
                </div>
                <div className="form-group">
                  <label>Album</label>
                  <select
                    value={newImage.albumId}
                    onChange={(e) => setNewImage({...newImage, albumId: e.target.value})}
                  >
                    <option value="">No Album</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newImage.tags}
                    onChange={(e) => setNewImage({...newImage, tags: e.target.value})}
                    placeholder="beach, sunset, romantic"
                  />
                </div>
                {!editingImage && (
                  <div className="form-group">
                    <label>Select Images</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <MdUpload /> Choose Images
                    </button>
                  </div>
                )}
                <div className="form-buttons">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingImage(null);
                      setNewImage({ title: '', description: '', albumId: '', tags: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={editingImage ? handleUpdateImage : () => fileInputRef.current?.click()}
                  >
                    {editingImage ? 'Update' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Album Form */}
          {showAddAlbumForm && (
            <div className="form-overlay">
              <div className="form-content">
                <h3>{editingAlbum ? 'Edit Album' : 'Create New Album'}</h3>
                <div className="form-group">
                  <label>Album Name</label>
                  <input
                    type="text"
                    value={newAlbum.name}
                    onChange={(e) => setNewAlbum({...newAlbum, name: e.target.value})}
                    placeholder="Album name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
                    placeholder="Album description"
                  />
                </div>
                <div className="form-buttons">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddAlbumForm(false);
                      setEditingAlbum(null);
                      setNewAlbum({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={editingAlbum ? handleUpdateAlbum : handleAddAlbum}
                  >
                    {editingAlbum ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Image Viewer */}
      {isImageViewerOpen && selectedImage && (
        <div className={`image-viewer-overlay ${isImageViewerClosing ? 'closing' : ''}`} onClick={closeImageViewer}>
          <div className={`image-viewer-content ${isImageViewerClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title}
              className={`image-viewer-img ${isImageViewerClosing ? 'closing' : ''}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryModal;
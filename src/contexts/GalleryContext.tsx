import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import usPhoto from '../assets/us.webp';

export interface Photo {
  id: string;
  url: string;
  title: string;
  albumId: string | null;
  favorite: boolean;
  addedAt: string; // YYYY-MM-DD
  tags: string[];
  sample?: boolean; // shipped with the app, not uploaded
}

export interface Album {
  id: string;
  name: string;
  createdAt: string;
}

interface GalleryContextValue {
  photos: Photo[];
  albums: Album[];
  addPhotos: (files: File[], meta: { albumId: string | null; tags: string[] }) => void;
  updatePhoto: (id: string, updates: Partial<Pick<Photo, 'title' | 'albumId' | 'tags' | 'favorite'>>) => void;
  removePhoto: (id: string) => void;
  addAlbum: (name: string) => Album;
  renameAlbum: (id: string, name: string) => void;
  removeAlbum: (id: string) => void;
}

const GalleryContext = createContext<GalleryContextValue | undefined>(undefined);

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Gallery storage is not wired to the backend yet: uploads live in memory
// for this visit only. The one shipped photo is the couple's own.
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: 'us', url: usPhoto, title: 'Us', albumId: null, favorite: true, addedAt: '', tags: [], sample: true },
  ]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const addPhotos = useCallback<GalleryContextValue['addPhotos']>((files, meta) => {
    const added = files.map((file) => ({
      id: uid(),
      url: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ''),
      albumId: meta.albumId,
      favorite: false,
      addedAt: today(),
      tags: meta.tags,
    }));
    setPhotos((prev) => [...added, ...prev]);
  }, []);

  const updatePhoto = useCallback<GalleryContextValue['updatePhoto']>((id, updates) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && !target.sample) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const addAlbum = useCallback((name: string) => {
    const album = { id: uid(), name, createdAt: today() };
    setAlbums((prev) => [...prev, album]);
    return album;
  }, []);

  const renameAlbum = useCallback((id: string, name: string) => {
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
  }, []);

  const removeAlbum = useCallback((id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setPhotos((prev) => prev.map((p) => (p.albumId === id ? { ...p, albumId: null } : p)));
  }, []);

  const value = useMemo(
    () => ({ photos, albums, addPhotos, updatePhoto, removePhoto, addAlbum, renameAlbum, removeAlbum }),
    [photos, albums, addPhotos, updatePhoto, removePhoto, addAlbum, renameAlbum, removeAlbum],
  );

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used within a GalleryProvider');
  return ctx;
}

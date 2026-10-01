import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  FolderSimple,
  Heart,
  Images,
  Plus,
  Trash,
  UploadSimple,
  X,
} from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button, IconButton } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Sheet } from '../components/ui/Sheet';
import { EmptyState, SkeletonRows } from '../components/ui/Feedback';
import { FieldGroup, InputRow } from '../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../components/ui/Toast';
import { useGallery, type Photo } from '../data/gallery';
import { uploadPhotos } from '../features/gallery/upload';
import { navFor } from '../app/nav';
import { plural } from '../lib/format';

type View = 'photos' | 'albums' | 'favorites';

function Viewer({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { albums, updatePhoto, removePhoto } = useGallery();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [armed, setArmed] = useState(false);
  const photo = photos[index];

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => setArmed(false), [index]);

  const step = useCallback((n: number) => onIndex((index + n + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  if (!photo) return null;

  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-label={photo.title || 'Photo'}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="viewer__bar">
        <IconButton label="Close" onClick={onClose}>
          <X size={20} weight="bold" />
        </IconButton>
        <span className="viewer__title">{photo.title || 'Photo'}</span>
        <span className="viewer__pos num">
          {index + 1} of {photos.length}
        </span>
      </div>
      <div className="viewer__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {photos.length > 1 && (
          <IconButton label="Previous photo" className="viewer__nav viewer__nav--prev" onClick={() => step(-1)}>
            <CaretLeft size={22} weight="bold" />
          </IconButton>
        )}
        <img key={photo.id} className="viewer__img" src={photo.url} alt={photo.title || 'Photo'} />
        {photos.length > 1 && (
          <IconButton label="Next photo" className="viewer__nav viewer__nav--next" onClick={() => step(1)}>
            <CaretRight size={22} weight="bold" />
          </IconButton>
        )}
      </div>
      <div className="viewer__tools">
        <IconButton
          label={photo.favorite ? 'Remove from favorites' : 'Add to favorites'}
          tone={photo.favorite ? 'accent' : 'default'}
          onClick={() => updatePhoto(photo.id, { favorite: !photo.favorite }).catch(() => toast(SAVE_FAILED, 'error'))}
        >
          <Heart size={22} weight={photo.favorite ? 'fill' : 'regular'} />
        </IconButton>
        <label className="viewer__album">
          <FolderSimple size={18} aria-hidden />
          <span className="visually-hidden">Album</span>
          <select value={photo.albumId ?? ''} onChange={(e) =>
              updatePhoto(photo.id, { albumId: e.target.value || null }).catch(() => toast(SAVE_FAILED, 'error'))
            }>
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <IconButton
          label={armed ? 'Tap again to delete' : 'Delete photo'}
          tone={armed ? 'filled' : 'default'}
          onBlur={() => setArmed(false)}
          onClick={() => {
            if (!armed) return setArmed(true);
            removePhoto(photo.id).catch(() => toast(SAVE_FAILED, 'error'));
            if (photos.length <= 1) onClose();
            else onIndex(Math.min(index, photos.length - 2));
          }}
        >
          <Trash size={20} />
        </IconButton>
      </div>
    </dialog>
  );
}

export default function GalleryPage() {
  const nav = navFor('/gallery');
  const { photos, albums, status, addPhotos, addAlbum } = useGallery();
  const toast = useToast();
  const [view, setView] = useState<View>('photos');
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [albumSheet, setAlbumSheet] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const album = albums.find((a) => a.id === albumId) ?? null;
  const shown = album
    ? photos.filter((p) => p.albumId === album.id)
    : view === 'favorites'
      ? photos.filter((p) => p.favorite)
      : photos;

  const onFiles = (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (fileRef.current) fileRef.current.value = '';
    if (list.length) void uploadPhotos(list, { albumId: album?.id ?? null, tags: [] }, addPhotos, toast);
  };

  const grid = (items: Photo[]) => (
    <ul className="photo-grid">
      {items.map((p, i) => (
        <li key={p.id}>
          <button type="button" className="photo-grid__item" onClick={() => setViewing(i)} aria-label={`Open ${p.title || 'photo'}`}>
            <img src={p.thumb} alt="" loading="lazy" />
            {p.favorite && <Heart className="photo-grid__fav" size={16} weight="fill" aria-hidden />}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<Images size={26} weight="fill" />}
        title={album ? album.name : 'Gallery'}
        description={album ? plural(shown.length, 'photo') : `${plural(photos.length, 'photo')}, ${plural(albums.length, 'album')}`}
        actions={
          <>
            {album && (
              <Button icon={<ArrowLeft size={16} weight="bold" />} onClick={() => setAlbumId(null)}>
                Albums
              </Button>
            )}
            <Button variant="primary" icon={<UploadSimple size={16} weight="bold" />} onClick={() => fileRef.current?.click()}>
              Add photos
            </Button>
          </>
        }
      />
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />

      {!album && (
        <div className="toolbar">
          <Segmented
            label="Show"
            value={view}
            onChange={setView}
            options={[
              { value: 'photos', label: 'Photos' },
              { value: 'albums', label: 'Albums' },
              { value: 'favorites', label: 'Favorites' },
            ]}
          />
        </div>
      )}

      {!album && view === 'albums' ? (
        <ul className="album-grid">
          {albums.map((a) => {
            const inAlbum = photos.filter((p) => p.albumId === a.id);
            return (
              <li key={a.id}>
                <button type="button" className="album" onClick={() => setAlbumId(a.id)}>
                  <span className="album__cover">
                    {inAlbum[0] ? <img src={inAlbum[0].thumb} alt="" /> : <Images size={28} aria-hidden />}
                  </span>
                  <span className="album__name">{a.name}</span>
                  <span className="album__count">{plural(inAlbum.length, 'photo')}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button type="button" className="album album--new" onClick={() => setAlbumSheet(true)}>
              <span className="album__cover">
                <Plus size={28} weight="bold" aria-hidden />
              </span>
              <span className="album__name">New album</span>
            </button>
          </li>
        </ul>
      ) : status === 'loading' ? (
        <SkeletonRows />
      ) : shown.length ? (
        grid(shown)
      ) : (
        <EmptyState
          icon={<Images size={28} />}
          title={
            status === 'error'
              ? "Photos aren't loading"
              : view === 'favorites' && !album
                ? 'No favorites yet'
                : 'No photos here yet'
          }
          action={
            <Button icon={<UploadSimple size={16} weight="bold" />} onClick={() => fileRef.current?.click()}>
              Add photos
            </Button>
          }
        >
          {status === 'error'
            ? "Your shared data isn't reachable right now."
            : view === 'favorites' && !album
              ? 'Tap the heart on a photo to keep it here.'
              : 'Add photos from your dates.'}
        </EmptyState>
      )}

      {viewing !== null && shown[viewing] && (
        <Viewer photos={shown} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />
      )}

      <Sheet open={albumSheet} onClose={() => setAlbumSheet(false)} title="New album">
        <form
          className="sheet-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = albumName.trim();
            if (!name) return;
            try {
              const created = await addAlbum(name);
              setAlbumName('');
              setAlbumSheet(false);
              setAlbumId(created.id);
            } catch {
              toast(SAVE_FAILED, 'error');
            }
          }}
        >
          <FieldGroup>
            <InputRow label="Name" placeholder="Beach trip" value={albumName} onChange={(e) => setAlbumName(e.target.value)} autoFocus />
          </FieldGroup>
          <div className="sheet-actions">
            <Button type="submit" variant="primary" disabled={!albumName.trim()}>
              Create album
            </Button>
          </div>
        </form>
      </Sheet>
    </Page>
  );
}

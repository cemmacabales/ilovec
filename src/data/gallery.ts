import { photoBucket, supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, refetch, setQueryData, useQuery } from '../lib/query';

export interface Photo {
  id: string;
  url: string; // full size, for the viewer
  thumb: string; // small, for grids and covers
  title: string;
  albumId: string | null;
  favorite: boolean;
  addedAt: string; // ISO timestamp
  tags: string[];
}

export interface Album {
  id: string;
  name: string;
  createdAt: string;
}

const PHOTOS = 'photos';
const ALBUMS = 'albums';

// Photos sit in a private bucket and are shown through signed URLs. URLs are
// reused until they're close to expiring, so refetching the list doesn't make
// the browser download every image again.
const SIGN_FOR = 12 * 60 * 60; // seconds
const signed = new Map<string, { url: string; expires: number }>();

async function signPaths(paths: string[]) {
  const now = Date.now();
  const stale = paths.filter((p) => (signed.get(p)?.expires ?? 0) - now < 60 * 60 * 1000);
  if (stale.length) {
    const { data, error } = await photoBucket().createSignedUrls(stale, SIGN_FOR);
    if (error) throw error;
    for (const item of data) {
      if (item.path && item.signedUrl) signed.set(item.path, { url: item.signedUrl, expires: now + SIGN_FOR * 1000 });
    }
  }
  return (path: string) => signed.get(path)?.url ?? '';
}

async function loadPhotos() {
  const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
  if (!data) return { data: null, error };
  try {
    const urlFor = await signPaths(data.flatMap((r) => [r.path, r.thumb_path]));
    return { data: data.map((r) => toPhoto(r, urlFor)), error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

function toPhoto(row: Tables<'photos'>, urlFor: (path: string) => string): Photo {
  return {
    id: row.id,
    url: urlFor(row.path),
    thumb: urlFor(row.thumb_path) || urlFor(row.path),
    title: row.title,
    albumId: row.album_id,
    favorite: row.favorite,
    addedAt: row.created_at,
    tags: row.tags,
  };
}

async function loadAlbums() {
  const { data, error } = await supabase.from('albums').select('*').order('created_at');
  return { data: data ? data.map((a) => ({ id: a.id, name: a.name, createdAt: a.created_at })) : null, error };
}

// Downscale on the device before uploading: phone photos are 3-12 MB, and
// nobody needs more than 2048px on a phone or laptop screen. Safari can't
// encode WebP from a canvas, so fall back to JPEG there.
function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function shrink(bitmap: ImageBitmap, maxSide: number, quality: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let blob = await encode(canvas, 'image/webp', quality);
  if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg', quality);
  if (!blob) throw new Error('Could not encode image');
  return blob;
}

async function uploadOne(file: File, meta: { albumId: string | null; tags: string[] }) {
  const bitmap = await createImageBitmap(file);
  const [full, thumb] = await Promise.all([shrink(bitmap, 2048, 0.85), shrink(bitmap, 640, 0.8)]).finally(() =>
    bitmap.close(),
  );
  const id = crypto.randomUUID();
  const ext = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : 'jpg');
  const path = `${id}.${ext(full)}`;
  const thumbPath = `thumbs/${id}.${ext(thumb)}`;
  const options = (blob: Blob) => ({ contentType: blob.type, cacheControl: '31536000', upsert: false });

  const bucket = photoBucket();
  const uploads = await Promise.all([bucket.upload(path, full, options(full)), bucket.upload(thumbPath, thumb, options(thumb))]);
  const failed = uploads.find((u) => u.error);
  if (failed) {
    await bucket.remove([path, thumbPath]);
    throw failed.error;
  }

  const { error } = await supabase.from('photos').insert({
    id,
    path,
    thumb_path: thumbPath,
    title: file.name.replace(/\.[^.]+$/, ''),
    album_id: meta.albumId,
    tags: meta.tags,
  });
  if (error) {
    await bucket.remove([path, thumbPath]);
    throw error;
  }
}

export function useGallery() {
  const photos = useQuery<Photo[]>(PHOTOS, loadPhotos, []);
  const albums = useQuery<Album[]>(ALBUMS, loadAlbums, []);

  return {
    photos: photos.data,
    albums: albums.data,
    status: photos.status,

    // Uploads one at a time so a big batch doesn't hold every decoded image in
    // memory at once. Returns how many made it.
    async addPhotos(files: File[], meta: { albumId: string | null; tags: string[] }) {
      let added = 0;
      for (const file of files) {
        try {
          await uploadOne(file, meta);
          added++;
        } catch (err) {
          console.error('Photo upload failed', file.name, err);
        }
      }
      await refetch(PHOTOS);
      return { added, failed: files.length - added };
    },

    updatePhoto(id: string, updates: Partial<Pick<Photo, 'title' | 'albumId' | 'tags' | 'favorite'>>) {
      return mutate<Photo[]>(
        PHOTOS,
        (prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        () =>
          supabase
            .from('photos')
            .update({
              ...(updates.title !== undefined && { title: updates.title }),
              ...(updates.albumId !== undefined && { album_id: updates.albumId }),
              ...(updates.tags !== undefined && { tags: updates.tags }),
              ...(updates.favorite !== undefined && { favorite: updates.favorite }),
            })
            .eq('id', id),
      );
    },

    async removePhoto(id: string) {
      const { data: row } = await supabase.from('photos').select('path, thumb_path').eq('id', id).maybeSingle();
      await mutate<Photo[]>(
        PHOTOS,
        (prev) => prev.filter((p) => p.id !== id),
        () => supabase.from('photos').delete().eq('id', id),
      );
      // The row is gone, so a failed file cleanup only leaves an unreachable object behind.
      if (row) await photoBucket().remove([row.path, row.thumb_path]);
    },

    async addAlbum(name: string): Promise<Album> {
      const { data: row, error } = await supabase.from('albums').insert({ name }).select().single();
      if (error) throw error;
      const album = { id: row.id, name: row.name, createdAt: row.created_at };
      setQueryData<Album[]>(ALBUMS, (prev) => [...prev, album]);
      return album;
    },

    renameAlbum(id: string, name: string) {
      return mutate<Album[]>(
        ALBUMS,
        (prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)),
        () => supabase.from('albums').update({ name }).eq('id', id),
      );
    },

    async removeAlbum(id: string) {
      await mutate<Album[]>(
        ALBUMS,
        (prev) => prev.filter((a) => a.id !== id),
        () => supabase.from('albums').delete().eq('id', id),
      );
      // Photos stay; the database clears their album.
      setQueryData<Photo[]>(PHOTOS, (prev) => prev.map((p) => (p.albumId === id ? { ...p, albumId: null } : p)));
    },
  };
}

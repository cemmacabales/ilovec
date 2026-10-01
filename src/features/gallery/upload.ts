import { plural } from '../../lib/format';
import type { useGallery } from '../../data/gallery';

type AddPhotos = ReturnType<typeof useGallery>['addPhotos'];
type Toast = (message: string, tone?: 'ok' | 'error') => void;

// Shared by the Gallery page and the Home widget: upload, then say how it went.
export async function uploadPhotos(
  files: File[],
  meta: Parameters<AddPhotos>[1],
  addPhotos: AddPhotos,
  toast: Toast,
) {
  toast(`Uploading ${plural(files.length, 'photo')}`);
  const { added, failed } = await addPhotos(files, meta);
  if (!failed) toast(`Added ${plural(added, 'photo')}`);
  else if (!added) toast("Couldn't upload. Check your connection and try again.", 'error');
  else toast(`Added ${plural(added, 'photo')}. ${failed} didn't upload.`, 'error');
}

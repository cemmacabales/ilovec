import { ArrowUpRight, MusicNotesSimple } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { navFor } from '../app/nav';

const PLAYLIST = 'ph/playlist/mylove/pl.u-pMylgvLtW7RGMk5';

export default function MusicPage() {
  const nav = navFor('/music');
  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<MusicNotesSimple size={26} weight="fill" />}
        title="Music"
        description="mylove, the playlist you both add to"
        actions={
          <a className="btn btn--secondary" href={`https://music.apple.com/${PLAYLIST}`} target="_blank" rel="noreferrer">
            <ArrowUpRight size={16} weight="bold" aria-hidden />
            <span>Open in Apple Music</span>
          </a>
        }
      />
      <div className="music-embed">
        <iframe
          title="mylove playlist on Apple Music"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={`https://embed.music.apple.com/${PLAYLIST}`}
          loading="lazy"
        />
      </div>
    </Page>
  );
}

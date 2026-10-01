import {
  CalendarHeart,
  CheckCircle,
  FilmSlate,
  House,
  Images,
  Mountains,
  MusicNotesSimple,
  Wallet,
  type Icon,
} from '@phosphor-icons/react';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  // Shared view-transition name between a Home widget and its page.
  tile: string;
  tab?: boolean; // shown in the phone tab bar
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: House, tile: 'tile-home', tab: true },
  { to: '/dates', label: 'Dates', icon: CalendarHeart, tile: 'tile-dates', tab: true },
  { to: '/tasks', label: 'Tasks', icon: CheckCircle, tile: 'tile-tasks', tab: true },
  { to: '/budget', label: 'Budget', icon: Wallet, tile: 'tile-budget', tab: true },
  { to: '/watch', label: 'Watchlist', icon: FilmSlate, tile: 'tile-watch' },
  { to: '/gallery', label: 'Gallery', icon: Images, tile: 'tile-gallery' },
  { to: '/bucket-list', label: 'Bucket list', icon: Mountains, tile: 'tile-bucket' },
  { to: '/music', label: 'Music', icon: MusicNotesSimple, tile: 'tile-music' },
];

export function navFor(to: string) {
  return NAV.find((n) => n.to === to)!;
}

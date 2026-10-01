import { useEffect, useState } from 'react';
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { ArrowsClockwise, CaretRight, CloudSlash, DotsThreeCircle, Heart, SignOut } from '@phosphor-icons/react';
import { NAV } from './nav';
import { useConnection } from '../lib/connection';
import { signOut, useMe } from '../lib/auth';
import { personLabel } from '../lib/format';
import { demoMode } from '../dev/flag';
import { useTheme, type ThemePref } from '../lib/theme';
import { Segmented } from '../components/ui/Segmented';
import { Sheet } from '../components/ui/Sheet';

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function Brand() {
  return (
    <NavLink to="/" viewTransition className="brand">
      <span className="brand__mark" aria-hidden>
        <Heart size={16} weight="fill" />
      </span>
      <span className="brand__text">
        <span className="brand__name">I Love C</span>
        <span className="brand__sub">C &amp; C</span>
      </span>
    </NavLink>
  );
}

function ThemePicker() {
  const [theme, setTheme] = useTheme();
  return <Segmented label="Appearance" options={THEMES} value={theme} onChange={setTheme} stretch />;
}

function Account() {
  const { person } = useMe();
  if (demoMode) return <p className="account">Sample data (demo)</p>;
  return (
    <div className="account">
      <span>{person ? `Signed in as ${personLabel(person)}` : 'Signed in'}</span>
      <button type="button" className="account__out" onClick={() => void signOut()}>
        <SignOut size={14} weight="bold" aria-hidden />
        Sign out
      </button>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Sections">
      <Brand />
      <nav className="sidebar__nav">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} viewTransition className="side-link">
            {({ isActive }) => (
              <>
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__foot">
        <span className="sidebar__foot-label">Appearance</span>
        <ThemePicker />
        <Account />
      </div>
    </aside>
  );
}

function TabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const more = NAV.filter((n) => !n.tab);
  const inMore = more.some((n) => location.pathname.startsWith(n.to));

  useEffect(() => setMoreOpen(false), [location.pathname]);

  return (
    <>
      <nav className="tabbar" aria-label="Sections">
        {NAV.filter((n) => n.tab).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} viewTransition className="tab">
            {({ isActive }) => (
              <>
                <Icon size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          className="tab"
          aria-current={inMore ? 'page' : undefined}
          aria-haspopup="dialog"
          onClick={() => setMoreOpen(true)}
        >
          <DotsThreeCircle size={24} weight={inMore ? 'fill' : 'regular'} aria-hidden />
          <span>More</span>
        </button>
      </nav>
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="link-list">
          {more.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} viewTransition className="link-list__row">
              <span className="link-list__icon" aria-hidden>
                <Icon size={18} weight="fill" />
              </span>
              <span className="link-list__label">{label}</span>
              <CaretRight size={14} weight="bold" className="link-list__chev" aria-hidden />
            </NavLink>
          ))}
        </div>
        <div className="more-theme">
          <span className="field-group__label">Appearance</span>
          <ThemePicker />
          <Account />
        </div>
      </Sheet>
    </>
  );
}

function ConnectionBanner() {
  const state = useConnection();
  if (state !== 'offline') return null;
  return (
    <div className="banner" role="status">
      <CloudSlash size={18} weight="bold" aria-hidden />
      <p>
        <strong>Can't reach your shared data.</strong> You can look around, but changes won't save until it's back.
      </p>
      <button type="button" className="banner__action" onClick={() => window.location.reload()}>
        <ArrowsClockwise size={14} weight="bold" aria-hidden />
        Retry
      </button>
    </div>
  );
}

export default function AppShell() {
  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar />
      <main id="main" className="shell__main" tabIndex={-1}>
        <ConnectionBanner />
        <Outlet />
      </main>
      <TabBar />
      <ScrollRestoration />
    </div>
  );
}

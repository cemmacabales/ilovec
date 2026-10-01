import { useEffect, useState } from 'react';
import { greeting, longToday } from '../lib/format';
import {
  BucketWidget,
  GalleryWidget,
  MusicWidget,
  NextDateWidget,
  SpendWidget,
  TasksWidget,
  WatchWidget,
} from '../features/home/widgets';

// Play the widget entrance once per visit, not on every return to Home.
let hasEntered = false;

export default function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const [entering] = useState(() => !hasEntered);

  useEffect(() => {
    hasEntered = true;
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="page page--home" data-entering={entering || undefined}>
      <header className="home-head">
        <h1 className="home-head__title">{greeting(now)}, C &amp; C</h1>
        <p className="home-head__date">{longToday(now)}</p>
      </header>
      <div className="widgets-wrap">
        <div className="widgets">
          <NextDateWidget index={0} />
          <SpendWidget index={1} />
          <BucketWidget index={2} />
          <TasksWidget index={3} />
          <WatchWidget index={4} />
          <GalleryWidget index={5} />
          <MusicWidget index={6} />
        </div>
      </div>
    </div>
  );
}

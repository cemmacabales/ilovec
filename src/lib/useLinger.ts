import { useCallback, useEffect, useRef, useState } from 'react';

// Keeps an item on screen for a beat after it's checked off, so the
// check animation lands before the row leaves the list.
export function useLinger(commit: (id: string) => Promise<void>, delay = 650) {
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set());
  const timers = useRef<number[]>([]);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = useCallback(
    (id: string) => {
      setLeaving((s) => new Set(s).add(id));
      timers.current.push(
        window.setTimeout(async () => {
          try {
            await commitRef.current(id);
          } finally {
            setLeaving((s) => {
              const next = new Set(s);
              next.delete(id);
              return next;
            });
          }
        }, delay),
      );
    },
    [delay],
  );

  return { leaving, start };
}

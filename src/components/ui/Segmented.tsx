import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  stretch?: boolean;
}

// iOS-style segmented control with a sliding thumb.
export function Segmented<T extends string>({ options, value, onChange, label, stretch }: SegmentedProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.children[index + 1] as HTMLElement | undefined;
      if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [index, options.length]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    (listRef.current?.children[next + 1] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      ref={listRef}
      className={['segmented', stretch && 'segmented--stretch'].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
    >
      <span
        className="segmented__thumb"
        aria-hidden
        style={thumb ? { width: thumb.w, transform: `translateX(${thumb.x}px)` } : { opacity: 0 }}
      />
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="segmented__item"
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.count !== undefined && <span className="segmented__count num">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

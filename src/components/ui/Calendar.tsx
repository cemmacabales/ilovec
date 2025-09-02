import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import React from 'react';

type Props = {
  selected?: Date | undefined;
  onSelect?: (day?: Date) => void;
  modifiers?: Parameters<typeof DayPicker>[0]['modifiers'];
  footer?: React.ReactNode;
  className?: string;
};

// Custom Day that blurs immediately on focus to prevent browser focus rings (Chromium/Arc)
function CustomDay(props: any) {
  const { children, ...rest } = props;
  return (
    <button
      {...rest}
      onFocus={(e) => {
        // preserve any existing onFocus
        if (typeof rest.onFocus === 'function') rest.onFocus(e);
        // remove focus instantly to prevent UA focus ring while keeping click keyboard-accessible fallback
        try {
          (e.currentTarget as HTMLElement).blur();
        } catch (err) {
          /* ignore */
        }
      }}
    >
      {children}
    </button>
  );
}

export function Calendar({ selected, onSelect, modifiers, footer, className }: Props) {
  return (
    <div className={className}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        modifiers={modifiers}
        className="rdp-root"
        captionLayout="dropdown"
        showOutsideDays
        weekStartsOn={1}
        footer={footer}
        components={{ Day: CustomDay }}
      />
    </div>
  );
}

export default Calendar;

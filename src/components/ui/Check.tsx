import { Check as CheckIcon } from '@phosphor-icons/react';

interface CheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: 'md' | 'sm';
  disabled?: boolean;
}

// Round Reminders-style check: hollow when open, filled when done.
export function Check({ checked, onChange, label, size = 'md', disabled }: CheckProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={['check', size === 'sm' && 'check--sm'].filter(Boolean).join(' ')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <CheckIcon className="check__mark" weight="bold" aria-hidden />
    </button>
  );
}

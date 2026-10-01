import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { CaretUpDown } from '@phosphor-icons/react';

// Big borderless title field, like a Notion page title.
export function TitleInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="title-input">
      <span className="visually-hidden">{label}</span>
      <input type="text" autoComplete="off" {...rest} />
    </label>
  );
}

// iOS grouped list of rows.
export function FieldGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <fieldset className="field-group">
      {label && <legend className="field-group__label">{label}</legend>}
      <div className="field-group__rows">{children}</div>
    </fieldset>
  );
}

interface RowProps {
  label: string;
  icon?: ReactNode;
  hint?: string;
}

export function InputRow({ label, icon, hint, ...rest }: RowProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="field-row">
      <label htmlFor={id} className="field-row__label">
        {icon}
        {label}
      </label>
      <input id={id} className="field-row__control" aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
      {hint && (
        <span id={`${id}-hint`} className="visually-hidden">
          {hint}
        </span>
      )}
    </div>
  );
}

export function SelectRow({ label, icon, children, ...rest }: RowProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className="field-row">
      <label htmlFor={id} className="field-row__label">
        {icon}
        {label}
      </label>
      <span className="field-row__select">
        <select id={id} {...rest}>
          {children}
        </select>
        <CaretUpDown size={14} weight="bold" aria-hidden />
      </span>
    </div>
  );
}

export function ChoiceRow<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: RowProps & { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="field-row">
      <span id={id} className="field-row__label">
        {icon}
        {label}
      </span>
      <div className="choice" role="radiogroup" aria-labelledby={id}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className="choice__item"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NotesField({ label, ...rest }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className="notes-field">
      <label htmlFor={id} className="field-group__label">
        {label}
      </label>
      <textarea id={id} rows={3} {...rest} />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  );
}

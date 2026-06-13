import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface EditableFieldProps {
  value: number | string;
  onSave: (val: number | string) => void;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  compact?: boolean;
}

export function EditableField({
  value,
  onSave,
  type = 'number',
  min,
  max,
  className,
  suffix,
  prefix,
  compact,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleSave = () => {
    if (type === 'number') {
      let num = parseInt(inputValue, 10);
      if (Number.isNaN(num)) num = Number(value);
      if (min !== undefined) num = Math.max(min, num);
      if (max !== undefined) num = Math.min(max, num);
      onSave(num);
      setInputValue(String(num));
    } else {
      onSave(inputValue.trim() || String(value));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setInputValue(String(value));
      setEditing(false);
    }
  };

  const handleBlur = () => handleSave();

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        min={min}
        max={max}
        className={cn(
          'bg-transparent border-b-2 border-primary focus:outline-none px-1 -mx-1 tabular-nums',
          compact ? 'text-xs' : 'text-sm',
          className
        )}
      />
    );
  }

  const displayValue = type === 'number'
    ? `${prefix ?? ''}${value}${suffix ?? ''}`
    : `${prefix ?? ''}${value}${suffix ?? ''}`;

  return (
    <span
      onClick={() => setEditing(true)}
      className={cn(
        'group cursor-text inline-flex items-center gap-1 hover:bg-primary/5 rounded px-1 -mx-1 transition-colors',
        className
      )}
      title="Click to edit"
    >
      {displayValue}
      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity inline-block" />
    </span>
  );
}

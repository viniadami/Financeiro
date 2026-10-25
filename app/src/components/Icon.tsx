import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Ícone Material Symbols Rounded, sempre decorativo (aria-hidden). */
export function Icon({ name, size = 24, filled, className, style }: Props) {
  return (
    <span className={cn('material-symbols-rounded', filled && 'is-filled', className)} aria-hidden="true" style={{ fontSize: size, ...style }}>
      {name}
    </span>
  );
}

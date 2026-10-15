import type { CSSProperties } from 'react';

interface Props {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Ícone Material Symbols Rounded, sempre decorativo (aria-hidden). */
export function Icon({ name, size = 24, filled, className, style }: Props) {
  const cls = ['material-symbols-rounded', filled && 'is-filled', className].filter(Boolean).join(' ');
  return (
    <span className={cls} aria-hidden="true" style={{ fontSize: size, ...style }}>
      {name}
    </span>
  );
}

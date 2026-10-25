'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

interface Props {
  lines: [string, string];
  /** 'top': com o sheet aberto, fica acima dele e cresce para cima, sem cobrir a alça. */
  placement: 'bottom' | 'top';
  /** Em ms; null mantém o toast aberto (usado na demo do frame C). */
  duration: number | null;
  onUndo: () => void;
  onDone: () => void;
}

/** Confirmação com "Desfazer" (frame C). Pausa enquanto há hover ou foco. */
export function Toast({ lines, placement, duration, onUndo, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);

  useEffect(() => {
    if (duration === null || paused || leaving) return;
    const startedAt = Date.now();
    const t = window.setTimeout(() => setLeaving(true), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - startedAt;
    };
  }, [duration, paused, leaving]);

  // Com "reduzir movimento" a saída tem 0 ms; não depende de animationend.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(onDone, 220);
    return () => window.clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      role="status"
      className={cn(
        'absolute inset-x-3 z-40 flex items-center gap-2.5 rounded-button bg-toast-bg py-3 pr-2 pl-3.5 text-toast-text shadow-toast tabular-nums',
        placement === 'bottom' ? 'bottom-24' : 'bottom-[calc(100%_-_110px)]',
        leaving
          ? 'animate-toast-out'
          : cn(placement === 'bottom' ? 'animate-toast-in' : 'animate-toast-in-top', 'motion-reduce:animate-toast-fade-in'),
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="flex flex-none text-toast-accent">
        <Icon name="check_circle" size={24} filled />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-sm leading-[1.3] font-bold">{lines[0]}</div>
        {lines[1] && <div className="text-[13px] leading-[1.35] font-semibold text-toast-text-secondary">{lines[1]}</div>}
      </div>
      <button
        type="button"
        className="h-11 flex-none rounded-sm border-0 bg-transparent px-3 text-sm font-extrabold text-toast-accent hover:bg-toast-hover focus-visible:outline-toast-accent"
        onClick={onUndo}
      >
        Desfazer
      </button>
    </div>
  );
}

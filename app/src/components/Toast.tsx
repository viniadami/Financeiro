import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import './Toast.css';

interface Props {
  lines: [string, string];
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
  const startedAt = useRef(0);

  useEffect(() => {
    if (duration === null || paused || leaving) return;
    startedAt.current = Date.now();
    const t = window.setTimeout(() => setLeaving(true), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [duration, paused, leaving]);

  // Com "reduzir movimento" a saída tem 0 ms e animationend pode não vir.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(onDone, 220);
    return () => window.clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      role="status"
      className={`toast toast--${placement}${leaving ? ' is-leaving' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="toast__icon">
        <Icon name="check_circle" size={24} filled />
      </span>
      <div className="toast__text">
        <div className="toast__title">{lines[0]}</div>
        {lines[1] && <div className="toast__detail">{lines[1]}</div>}
      </div>
      <button type="button" className="toast__undo" onClick={onUndo}>
        Desfazer
      </button>
    </div>
  );
}

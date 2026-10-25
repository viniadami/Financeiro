import { barGeometry, LIMIT_POSITION, type BudgetStatus } from '@/lib/budget';
import { cn } from '@/lib/cn';

const HATCH = 'repeating-linear-gradient(135deg, var(--color-terracotta) 0 3px, var(--color-terracotta-hatch) 3px 6px)';
const WIDTH_MOTION = 'transition-[width] duration-(--motion-bar) ease-out';

interface Props {
  ratio: number;
  status: BudgetStatus;
  className?: string;
}

/**
 * Barra de orçamento do Sistema Visual v2: o limite (100%) fica a 2/3 da
 * largura, o excedente é hachurado em terracota e para em 150% com uma
 * marca de quebra. O estado também vem escrito ao lado, nunca só pela cor.
 */
export function BudgetBar({ ratio, status, className }: Props) {
  const g = barGeometry(ratio);
  const limit = `${LIMIT_POSITION * 100}%`;
  return (
    <span className={cn('relative block h-[5px]', className)} aria-hidden="true">
      <span className="absolute inset-y-0 left-0 rounded-pill bg-track" style={{ width: limit }} />
      <span
        className={cn(
          'absolute inset-y-0 left-0',
          WIDTH_MOTION,
          status === 'ok' ? 'bg-primary' : 'bg-amber-fill',
          g.overflow ? 'rounded-l-pill' : 'rounded-pill',
        )}
        style={{ width: `${g.fill}%` }}
      />
      {g.overflow > 0 && (
        <span
          className={cn('absolute inset-y-0 rounded-r-pill', WIDTH_MOTION)}
          style={{ left: limit, width: `${g.overflow}%`, background: HATCH }}
        />
      )}
      {g.broken &&
        [-6, 2].map((ml) => (
          <span key={ml} className="absolute -inset-y-[3px] w-1 -skew-x-[24deg] bg-surface" style={{ left: '87%', marginLeft: ml }} />
        ))}
      <span className="absolute -inset-y-[3px] -ml-px w-0.5 rounded-[1px] bg-text" style={{ left: limit }} />
    </span>
  );
}

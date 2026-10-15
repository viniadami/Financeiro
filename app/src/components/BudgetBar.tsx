import { barGeometry, LIMIT_POSITION, type BudgetStatus } from '../lib/budget';
import './BudgetBar.css';

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
    <span className={['budget-bar', `is-${status}`, className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className="budget-bar__track" style={{ width: limit }} />
      <span className={`budget-bar__fill${g.overflow ? ' is-capped' : ''}`} style={{ width: `${g.fill}%` }} />
      {g.overflow > 0 && <span className="budget-bar__overflow" style={{ left: limit, width: `${g.overflow}%` }} />}
      {g.broken && (
        <>
          <span className="budget-bar__break" style={{ left: '87%', marginLeft: -6 }} />
          <span className="budget-bar__break" style={{ left: '87%', marginLeft: 2 }} />
        </>
      )}
      <span className="budget-bar__limit" style={{ left: limit }} />
    </span>
  );
}

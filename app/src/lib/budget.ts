export type BudgetStatus = 'ok' | 'alert' | 'over';

/** A partir de 80% do limite o envelope entra em alerta (âmbar). */
export const ALERT_AT = 0.8;
/** Na barra, 100% do limite fica a 2/3 da largura (--budget-limit-position). */
export const LIMIT_POSITION = 2 / 3;
/** A barra para em 150% (--budget-cap); acima disso ganha a marca de quebra. */
export const CAP = 1.5;

export interface BudgetInfo {
  ratio: number;
  /** Percentual arredondado, para exibir. */
  pct: number;
  status: BudgetStatus;
  /** Positivo: quanto resta. Negativo: quanto passou. */
  remainingCents: number;
}

export function budgetInfo(spentCents: number, limitCents: number): BudgetInfo {
  const ratio = limitCents > 0 ? spentCents / limitCents : 0;
  return {
    ratio,
    pct: Math.round(ratio * 100),
    status: ratio > 1 ? 'over' : ratio >= ALERT_AT ? 'alert' : 'ok',
    remainingCents: limitCents - spentCents,
  };
}

export interface BarGeometry {
  /** Largura do trecho até o limite, em % da barra. */
  fill: number;
  /** Largura do excedente hachurado, em % da barra. */
  overflow: number;
  /** Passou do teto de 150%: mostra a marca de quebra. */
  broken: boolean;
}

export function barGeometry(ratio: number): BarGeometry {
  const r = Math.max(0, ratio);
  return {
    fill: Math.min(r, 1) * LIMIT_POSITION * 100,
    overflow: r > 1 ? (Math.min(r, CAP) - 1) * LIMIT_POSITION * 100 : 0,
    broken: r > CAP,
  };
}

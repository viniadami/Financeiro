import { describe, expect, it } from 'vitest';
import { barGeometry, budgetInfo } from './budget';

describe('budgetInfo', () => {
  it('reproduz os envelopes de Alimentação do frame B', () => {
    expect(budgetInfo(60300, 100000)).toMatchObject({ pct: 60, status: 'ok', remainingCents: 39700 });
    expect(budgetInfo(54800, 60000)).toMatchObject({ pct: 91, status: 'alert', remainingCents: 5200 });
    expect(budgetInfo(36260, 30000)).toMatchObject({ pct: 121, status: 'over', remainingCents: -6260 });
    expect(budgetInfo(16700, 18000)).toMatchObject({ pct: 93, status: 'alert', remainingCents: 1300 });
    expect(budgetInfo(168060, 208000)).toMatchObject({ pct: 81, status: 'alert', remainingCents: 39940 });
  });
});

describe('barGeometry', () => {
  it('põe 100% a 2/3 da largura', () => {
    expect(barGeometry(1).fill).toBeCloseTo(66.667, 2);
    expect(barGeometry(1).overflow).toBe(0);
  });

  it('hachura o excedente até o teto de 150%', () => {
    const g = barGeometry(1.21);
    expect(g.overflow).toBeCloseTo(14, 1);
    expect(g.broken).toBe(false);
  });

  it('para na borda e quebra acima de 150%', () => {
    const g = barGeometry(2.5);
    expect(g.fill + g.overflow).toBeCloseTo(100, 5);
    expect(g.broken).toBe(true);
  });
});

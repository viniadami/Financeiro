/** Sinal de menos tipográfico (U+2212). Despesas usam "− R$ 87,40". */
export const MINUS = '−';

/** Máximo de dígitos digitáveis no teclado (R$ 9.999.999,99). */
export const MAX_DIGITS = 9;

/** 8740 → "87,40"; 192680 → "1.926,80". */
export function formatAmount(cents: number): string {
  const abs = Math.abs(Math.round(cents));
  const int = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${int},${String(abs % 100).padStart(2, '0')}`;
}

export const brl = (cents: number) => `R$ ${formatAmount(cents)}`;
export const expense = (cents: number) => `${MINUS} R$ ${formatAmount(cents)}`;
export const income = (cents: number) => `+ R$ ${formatAmount(cents)}`;

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '00' | 'del';

/**
 * Digitação tipo caixa eletrônico: os dígitos entram pela direita,
 * então 8-7-4-0 vira R$ 87,40. Zeros à esquerda são descartados e
 * uma tecla que estouraria o limite é ignorada.
 */
export function pressKey(digits: string, key: KeypadKey, max = MAX_DIGITS): string {
  if (key === 'del') return digits.slice(0, -1);
  const next = (digits + key).replace(/^0+/, '');
  return next.length > max ? digits : next;
}

export const digitsToCents = (digits: string) => (digits ? parseInt(digits, 10) : 0);
export const centsToDigits = (cents: number) => (cents > 0 ? String(cents) : '');

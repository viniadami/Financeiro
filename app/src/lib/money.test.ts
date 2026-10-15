import { describe, expect, it } from 'vitest';
import { brl, expense, formatAmount, pressKey, type KeypadKey } from './money';

const type = (keys: KeypadKey[], start = '') => keys.reduce((d, k) => pressKey(d, k), start);

describe('formatAmount', () => {
  it('formata centavos no padrão brasileiro', () => {
    expect(formatAmount(0)).toBe('0,00');
    expect(formatAmount(5)).toBe('0,05');
    expect(formatAmount(8740)).toBe('87,40');
    expect(formatAmount(192680)).toBe('1.926,80');
    expect(formatAmount(123456789)).toBe('1.234.567,89');
  });

  it('usa o sinal de menos U+2212 seguido de espaço nas despesas', () => {
    expect(expense(8740)).toBe('− R$ 87,40');
    expect(brl(31200)).toBe('R$ 312,00');
  });
});

describe('pressKey (caixa eletrônico)', () => {
  it('8-7-4-0 vira R$ 87,40', () => {
    expect(formatAmount(Number(type(['8', '7', '4', '0'])))).toBe('87,40');
  });

  it('00 acrescenta dois zeros', () => {
    expect(type(['1', '00'])).toBe('100');
  });

  it('ignora zeros à esquerda', () => {
    expect(type(['0', '00', '5'])).toBe('5');
  });

  it('apagar remove o último dígito', () => {
    expect(type(['del'], '8740')).toBe('874');
    expect(type(['del'], '')).toBe('');
  });

  it('não passa do limite de dígitos', () => {
    expect(type(['1'], '123456789')).toBe('123456789');
    expect(type(['00'], '12345678')).toBe('12345678');
  });
});

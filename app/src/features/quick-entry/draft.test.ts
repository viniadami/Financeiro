import { describe, expect, it } from 'vitest';
import { draftReducer, emptyDraft, missingField, type Draft, type DraftAction } from './draft';

const run = (actions: DraftAction[], start: Draft = emptyDraft()) => actions.reduce(draftReducer, start);

describe('fluxo-alvo: valor → categoria → Salvar', () => {
  it('Alimentação pré-seleciona Supermercado e sugere o VA', () => {
    const d = run([
      { type: 'key', key: '8' },
      { type: 'key', key: '7' },
      { type: 'key', key: '4' },
      { type: 'key', key: '0' },
      { type: 'category', id: 'alimentacao' },
    ]);
    expect(d.digits).toBe('8740');
    expect(d.subId).toBe('supermercado');
    expect(d.accountId).toBe('va');
    expect(d.panel).toBe('subcategories');
    expect(missingField(d)).toBeNull();
  });

  it('Restaurantes sugere o Cartão Panty', () => {
    const d = run([{ type: 'category', id: 'alimentacao' }, { type: 'subcategory', id: 'restaurantes' }]);
    expect(d.accountId).toBe('cartao-panty');
    expect(d.panel).toBe('categories');
  });

  it('conta escolhida à mão não é trocada pela sugestão', () => {
    const d = run([
      { type: 'panel', panel: 'account' },
      { type: 'account', id: 'conta-vini' },
      { type: 'category', id: 'alimentacao' },
    ]);
    expect(d.accountId).toBe('conta-vini');
  });

  it('sem valor ou sem categoria não salva', () => {
    expect(missingField(emptyDraft())).toBe('Digite o valor');
    expect(missingField(run([{ type: 'key', key: '5' }]))).toBe('Escolha a categoria');
  });
});

describe('transferência', () => {
  it('sugere Pagar fatura: Conta Vini → Cartão Vini, R$ 1.926,80', () => {
    const d = run([{ type: 'kind', kind: 'transferencia' }]);
    expect(d).toMatchObject({ payInvoice: true, fromId: 'conta-vini', toId: 'cartao-vini', digits: '192680' });
    expect(missingField(d)).toBeNull();
  });

  it('não sobrescreve um valor já digitado', () => {
    const d = run([{ type: 'key', key: '5' }, { type: 'kind', kind: 'transferencia' }]);
    expect(d.digits).toBe('5');
    expect(d.payInvoice).toBe(false);
  });

  it('inverter troca origem e destino', () => {
    const d = run([{ type: 'kind', kind: 'transferencia' }, { type: 'swap' }]);
    expect(d).toMatchObject({ fromId: 'cartao-vini', toId: 'conta-vini', payInvoice: false });
  });
});

it('Meu dinheiro livre torna o lançamento privado e pessoal', () => {
  const d = run([{ type: 'more', patch: { private: true } }]);
  expect(d).toMatchObject({ private: true, scope: 'pessoal' });
});

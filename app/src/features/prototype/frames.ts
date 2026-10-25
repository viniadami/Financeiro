import { CURRENT_USER } from '@/data/reference';
import { draftCents, draftReducer, emptyDraft, type Draft } from '@/features/quick-entry/draft';
import { newEntryId, type Entry } from '@/state/ledger';

export type Frame = 'A' | 'B' | 'C' | 'D' | 'E';

export const FRAMES: { id: Frame; label: string }[] = [
  { id: 'A', label: 'Valor digitado, Alimentação' },
  { id: 'B', label: 'Subcategorias de Alimentação' },
  { id: 'C', label: 'Salvo, com Desfazer' },
  { id: 'D', label: 'Transferência: Pagar fatura' },
  { id: 'E', label: 'Arrastar para baixo' },
];

export function parseFrame(value: string | string[] | undefined): Frame | null {
  const f = (Array.isArray(value) ? value[0] : value)?.toUpperCase();
  return FRAMES.some((x) => x.id === f) ? (f as Frame) : null;
}

export function toEntry(d: Draft): Entry {
  const base = {
    id: newEntryId(),
    kind: d.kind,
    cents: draftCents(d),
    by: CURRENT_USER.initial,
    when: d.when,
    scope: d.scope,
    description: d.description.trim() || undefined,
    hasReceipt: d.hasReceipt || undefined,
    recurring: d.recurring || undefined,
  };
  if (d.kind === 'transferencia') return { ...base, fromId: d.fromId, toId: d.toId };
  if (d.kind === 'receita') return { ...base, accountId: d.accountId };
  return {
    ...base,
    categoryId: d.categoryId,
    subId: d.subId,
    accountId: d.accountId,
    installments: d.installments ?? undefined,
    private: d.private || undefined,
  };
}

export interface DemoState {
  sheet?: { draft: Draft; confirm?: boolean };
  entries?: Entry[];
  toastPinned?: boolean;
}

/** Estado inicial de cada frame do design (?frame=A … E). */
export function demoState(frame: Frame | null): DemoState {
  const typed: Draft = { ...emptyDraft(), digits: '8740', categoryId: 'alimentacao', subId: 'supermercado', accountId: 'va' };
  switch (frame) {
    case 'A':
      return { sheet: { draft: typed } };
    case 'B':
      return { sheet: { draft: { ...typed, panel: 'subcategories' } } };
    case 'C':
      return { entries: [toEntry(typed)], toastPinned: true };
    case 'D':
      return { sheet: { draft: draftReducer(emptyDraft(), { type: 'kind', kind: 'transferencia' }) } };
    case 'E':
      return { sheet: { draft: typed, confirm: true } };
    default:
      return {};
  }
}

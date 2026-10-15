import {
  ACCOUNTS,
  DEFAULT_ACCOUNT,
  PAY_INVOICE,
  categoryById,
  subcategoryById,
  type AccountId,
  type CategoryId,
} from '../../data/reference';
import { centsToDigits, digitsToCents, pressKey, type KeypadKey } from '../../lib/money';
import type { EntryKind } from '../../state/ledger';

/** O que ocupa a zona do meio do sheet. */
export type Panel = 'categories' | 'subcategories' | 'all-categories' | 'more' | 'account' | 'from' | 'to';

export interface Draft {
  kind: EntryKind;
  digits: string;
  categoryId?: CategoryId;
  subId?: string;
  accountId: AccountId;
  /** A pessoa escolheu a conta à mão: a categoria para de sugerir. */
  accountTouched: boolean;
  when: 'hoje' | 'ontem';
  scope: 'casa' | 'pessoal';
  description: string;
  hasReceipt: boolean;
  installments: number | null;
  recurring: boolean;
  private: boolean;
  fromId: AccountId;
  toId: AccountId;
  payInvoice: boolean;
  panel: Panel;
}

export const emptyDraft = (): Draft => ({
  kind: 'despesa',
  digits: '',
  accountId: DEFAULT_ACCOUNT,
  accountTouched: false,
  when: 'hoje',
  scope: 'casa',
  description: '',
  hasReceipt: false,
  installments: null,
  recurring: false,
  private: false,
  fromId: PAY_INVOICE.from,
  toId: PAY_INVOICE.to,
  payInvoice: false,
  panel: 'categories',
});

export type DraftAction =
  | { type: 'key'; key: KeypadKey }
  | { type: 'kind'; kind: EntryKind }
  | { type: 'category'; id: CategoryId }
  | { type: 'subcategory'; id: string }
  | { type: 'panel'; panel: Panel }
  | { type: 'account'; id: AccountId }
  | { type: 'toggle-when' }
  | { type: 'toggle-scope' }
  | { type: 'toggle-pay-invoice' }
  | { type: 'swap' }
  | { type: 'more'; patch: Partial<Pick<Draft, 'description' | 'hasReceipt' | 'installments' | 'recurring' | 'private'>> }
  | { type: 'reset-for-next' }
  | { type: 'replace'; draft: Draft };

function suggestAccount(d: Draft, categoryId: CategoryId, subId?: string): AccountId {
  if (d.accountTouched) return d.accountId;
  return subcategoryById(categoryId, subId)?.suggestedAccount ?? DEFAULT_ACCOUNT;
}

function payInvoiceDraft(d: Draft): Draft {
  const cents = ACCOUNTS[PAY_INVOICE.to].closedInvoiceCents ?? 0;
  return { ...d, payInvoice: true, fromId: PAY_INVOICE.from, toId: PAY_INVOICE.to, digits: centsToDigits(cents) };
}

export function draftReducer(d: Draft, a: DraftAction): Draft {
  switch (a.type) {
    case 'key': {
      const digits = pressKey(d.digits, a.key);
      // Mexer no valor desfaz a sugestão "Pagar fatura".
      return { ...d, digits, payInvoice: d.payInvoice && digits === d.digits };
    }
    case 'kind': {
      if (a.kind === d.kind) return d;
      const next: Draft = { ...d, kind: a.kind, panel: 'categories' };
      // Transferência sem valor digitado já sugere pagar a fatura fechada.
      if (a.kind === 'transferencia' && !d.digits) return payInvoiceDraft(next);
      if (d.kind === 'transferencia' && d.payInvoice) return { ...next, payInvoice: false, digits: '' };
      return next;
    }
    case 'category': {
      const cat = categoryById(a.id);
      if (cat.subcategories) {
        // Já pré-seleciona a última subcategoria usada para manter o fluxo em 1 toque.
        const subId = d.categoryId === a.id && d.subId ? d.subId : cat.lastUsedSub;
        return { ...d, categoryId: a.id, subId, accountId: suggestAccount(d, a.id, subId), panel: 'subcategories' };
      }
      return { ...d, categoryId: a.id, subId: undefined, accountId: suggestAccount(d, a.id), panel: 'categories' };
    }
    case 'subcategory':
      if (!d.categoryId) return d;
      return { ...d, subId: a.id, accountId: suggestAccount(d, d.categoryId, a.id), panel: 'categories' };
    case 'panel':
      return { ...d, panel: a.panel };
    case 'account':
      if (d.panel === 'from') return { ...d, fromId: a.id, payInvoice: false, panel: 'categories' };
      if (d.panel === 'to') return { ...d, toId: a.id, payInvoice: false, panel: 'categories' };
      return { ...d, accountId: a.id, accountTouched: true, panel: 'categories' };
    case 'toggle-when':
      return { ...d, when: d.when === 'hoje' ? 'ontem' : 'hoje' };
    case 'toggle-scope':
      return { ...d, scope: d.scope === 'casa' ? 'pessoal' : 'casa' };
    case 'toggle-pay-invoice':
      return d.payInvoice ? { ...d, payInvoice: false } : payInvoiceDraft(d);
    case 'swap':
      return { ...d, fromId: d.toId, toId: d.fromId, payInvoice: false };
    case 'more': {
      const next = { ...d, ...a.patch };
      // "Meu dinheiro livre" é sempre pessoal.
      if (a.patch.private) next.scope = 'pessoal';
      return next;
    }
    case 'reset-for-next':
      return {
        ...emptyDraft(),
        kind: d.kind,
        categoryId: d.categoryId,
        subId: d.subId,
        accountId: d.accountId,
        accountTouched: d.accountTouched,
        when: d.when,
        scope: d.scope,
        fromId: d.fromId,
        toId: d.toId,
      };
    case 'replace':
      return a.draft;
  }
}

export const draftCents = (d: Draft) => digitsToCents(d.digits);

/** Motivo para não salvar ainda, ou null quando dá para salvar. */
export function missingField(d: Draft): string | null {
  if (draftCents(d) === 0) return 'Digite o valor';
  if (d.kind === 'despesa') {
    if (!d.categoryId) return 'Escolha a categoria';
    if (categoryById(d.categoryId).subcategories && !d.subId) return 'Escolha a subcategoria';
  }
  if (d.kind === 'transferencia' && d.fromId === d.toId) return 'Origem e destino iguais';
  return null;
}

/** Quantas opções de "+ Mais" estão ligadas. */
export const moreCount = (d: Draft) =>
  [d.description.trim(), d.hasReceipt, d.installments, d.recurring, d.private].filter(Boolean).length;

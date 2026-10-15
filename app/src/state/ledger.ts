import { useCallback, useMemo, useState } from 'react';
import {
  ACCOUNTS,
  CATEGORIES,
  CURRENT_USER,
  VARIABLE_BUDGET,
  categoryById,
  subcategoryById,
  type AccountId,
  type CategoryId,
  type Person,
} from '../data/reference';
import { budgetInfo, type BudgetInfo } from '../lib/budget';
import { brl, expense, formatAmount, income } from '../lib/money';

export type EntryKind = 'despesa' | 'receita' | 'transferencia';

export interface Entry {
  id: string;
  kind: EntryKind;
  cents: number;
  by: Person;
  when: 'hoje' | 'ontem';
  /** Gasto do casal ("Casa") ou só da pessoa. */
  scope: 'casa' | 'pessoal';
  categoryId?: CategoryId;
  subId?: string;
  accountId?: AccountId;
  fromId?: AccountId;
  toId?: AccountId;
  description?: string;
  hasReceipt?: boolean;
  installments?: number;
  recurring?: boolean;
  /** "Meu dinheiro livre": só quem lançou vê os detalhes. */
  private?: boolean;
}

let seq = 0;
export const newEntryId = () => `e${Date.now().toString(36)}${(seq++).toString(36)}`;

export function useLedger(initial: Entry[] = []) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const add = useCallback((e: Entry) => setEntries((xs) => [e, ...xs]), []);
  const remove = useCallback((id: string) => setEntries((xs) => xs.filter((x) => x.id !== id)), []);
  const selectors = useMemo(() => makeSelectors(entries), [entries]);
  return { entries, add, remove, ...selectors };
}

export type Ledger = ReturnType<typeof useLedger>;

function makeSelectors(entries: Entry[]) {
  const expenses = entries.filter((e) => e.kind === 'despesa');

  const subSpent = (categoryId: CategoryId, subId: string) => {
    const base = subcategoryById(categoryId, subId)?.spentCents ?? 0;
    return base + expenses.filter((e) => e.categoryId === categoryId && e.subId === subId).reduce((a, e) => a + e.cents, 0);
  };

  const subBudget = (categoryId: CategoryId, subId: string): BudgetInfo | undefined => {
    const sub = subcategoryById(categoryId, subId);
    return sub ? budgetInfo(subSpent(categoryId, subId), sub.limitCents) : undefined;
  };

  /** Só categorias com envelopes (subcategorias com limite) têm orçamento. */
  const categoryBudget = (categoryId: CategoryId) => {
    const subs = categoryById(categoryId).subcategories;
    if (!subs) return undefined;
    const limit = subs.reduce((a, s) => a + s.limitCents, 0);
    const spent = subs.reduce((a, s) => a + subSpent(categoryId, s.id), 0);
    return { ...budgetInfo(spent, limit), spentCents: spent, limitCents: limit };
  };

  const accountBalance = (id: AccountId) => {
    const start = ACCOUNTS[id].balanceCents;
    if (start === undefined) return undefined;
    return entries.reduce((bal, e) => {
      if (e.kind === 'despesa' && e.accountId === id) return bal - e.cents;
      if (e.kind === 'receita' && e.accountId === id) return bal + e.cents;
      if (e.kind === 'transferencia' && e.fromId === id) return bal - e.cents;
      if (e.kind === 'transferencia' && e.toId === id) return bal + e.cents;
      return bal;
    }, start);
  };

  const variable = (() => {
    const spent = VARIABLE_BUDGET.spentCents + expenses.reduce((a, e) => a + e.cents, 0);
    return { ...budgetInfo(spent, VARIABLE_BUDGET.limitCents), spentCents: spent, limitCents: VARIABLE_BUDGET.limitCents };
  })();

  return { subBudget, categoryBudget, accountBalance, variable, categoriesWithBudget: CATEGORIES.filter((c) => c.subcategories) };
}

export type Selectors = ReturnType<typeof makeSelectors>;

/** Linha de detalhe da conta: saldo quando a conta tem, senão a descrição. */
export function accountDetail(id: AccountId, s: Selectors) {
  const bal = s.accountBalance(id);
  return bal !== undefined ? `saldo ${brl(bal)}` : ACCOUNTS[id].detail;
}

export function entryTitle(e: Entry): string {
  if (e.private && e.by === CURRENT_USER.initial) return e.description || 'Meu dinheiro livre';
  if (e.private) return 'Privado';
  if (e.kind === 'transferencia') return `${ACCOUNTS[e.fromId!].short} → ${ACCOUNTS[e.toId!].short}`;
  if (e.description) return e.description;
  if (e.kind === 'despesa' && e.categoryId) {
    return subcategoryById(e.categoryId, e.subId)?.name ?? categoryById(e.categoryId).name;
  }
  return 'Receita';
}

export function entryPath(e: Pick<Entry, 'categoryId' | 'subId'>): string {
  if (!e.categoryId) return '';
  const cat = categoryById(e.categoryId);
  const sub = subcategoryById(e.categoryId, e.subId);
  return sub ? `${cat.name} › ${sub.name}` : cat.name;
}

export function signedAmount(e: Entry): string {
  if (e.kind === 'despesa') return expense(e.cents);
  if (e.kind === 'receita') return income(e.cents);
  return brl(e.cents);
}

/** As duas linhas do toast de confirmação (frame C). */
export function toastLines(e: Entry, s: Selectors): [string, string] {
  if (e.kind === 'transferencia') {
    return [
      `R$ ${formatAmount(e.cents)} de ${ACCOUNTS[e.fromId!].short} para ${ACCOUNTS[e.toId!].short}`,
      'transferência não conta como despesa',
    ];
  }
  const parts: string[] = [];
  if (e.kind === 'despesa' && e.categoryId) {
    const b = s.categoryBudget(e.categoryId);
    if (b) parts.push(b.remainingCents >= 0 ? `restam ${brl(b.remainingCents)}` : `! passou ${brl(-b.remainingCents)}`);
  }
  if (e.accountId) {
    const bal = s.accountBalance(e.accountId);
    if (bal !== undefined) parts.push(`${ACCOUNTS[e.accountId].short}: saldo ${brl(bal)}`);
    else parts.push(ACCOUNTS[e.accountId].short);
  }
  if (e.private) parts.unshift('privado');
  const head = e.kind === 'despesa' ? `R$ ${formatAmount(e.cents)} em ${entryPath(e)}` : `R$ ${formatAmount(e.cents)} de receita`;
  return [head, parts.join(' · ')];
}

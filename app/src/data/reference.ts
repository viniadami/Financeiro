/**
 * Dados de referência de quarta-feira, 14/10/2026, como aparecem no P1
 * (valores de antes do lançamento de R$ 87,40). Não alterar os números.
 */

export type Person = 'V' | 'P';

export const CURRENT_USER: { initial: Person; name: string } = { initial: 'P', name: 'Panty' };

export const TODAY = {
  label: 'Quarta, 14/10',
  periodEnd: '31/10',
  daysLeft: 17,
};

export type AccountId = 'conta-vini' | 'cartao-vini' | 'cartao-panty' | 'va';

export interface Account {
  id: AccountId;
  name: string;
  /** Nome curto usado no toast e na lista ("VA"). */
  short: string;
  icon: string;
  detail: string;
  owner: Person;
  /** Saldo inicial, só para contas que exibem saldo. */
  balanceCents?: number;
  /** Fatura fechada aguardando pagamento. */
  closedInvoiceCents?: number;
}

export const ACCOUNTS: Record<AccountId, Account> = {
  'conta-vini': {
    id: 'conta-vini',
    name: 'Conta Vini',
    short: 'Conta Vini',
    icon: 'account_balance',
    detail: 'conta corrente',
    owner: 'V',
  },
  'cartao-vini': {
    id: 'cartao-vini',
    name: 'Cartão Vini',
    short: 'Cartão Vini',
    icon: 'credit_card',
    detail: 'fatura fechada em 07/10 · vence 17/10',
    owner: 'V',
    closedInvoiceCents: 192680,
  },
  'cartao-panty': {
    id: 'cartao-panty',
    name: 'Cartão Panty',
    short: 'Cartão Panty',
    icon: 'credit_card',
    detail: 'cartão de crédito',
    owner: 'P',
  },
  va: {
    id: 'va',
    name: 'Vale-alimentação',
    short: 'VA',
    icon: 'account_balance_wallet',
    detail: 'vale-alimentação',
    owner: 'P',
    balanceCents: 50740,
  },
};

export const ACCOUNT_ORDER: AccountId[] = ['va', 'cartao-panty', 'conta-vini', 'cartao-vini'];

/** Conta sugerida quando a categoria não indica outra. */
export const DEFAULT_ACCOUNT: AccountId = 'cartao-panty';

/** "Pagar fatura": a transferência que o P1 sugere. */
export const PAY_INVOICE = {
  from: 'conta-vini' as AccountId,
  to: 'cartao-vini' as AccountId,
};

export type CategoryId =
  | 'moradia'
  | 'transporte'
  | 'alimentacao'
  | 'saude'
  | 'educacao'
  | 'cuidados-pessoais'
  | 'lazer-esporte'
  | 'vestuario'
  | 'assinaturas'
  | 'presentes'
  | 'dinheiro-livre'
  | 'financeiro'
  | 'futuro';

export interface Subcategory {
  id: string;
  name: string;
  icon: string;
  limitCents: number;
  /** Gasto no período antes dos lançamentos desta sessão. */
  spentCents: number;
  suggestedAccount: AccountId;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
  /** Subcategoria pré-selecionada ao tocar a categoria. */
  lastUsedSub?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', icon: 'home' },
  { id: 'transporte', name: 'Transporte', icon: 'directions_car' },
  {
    id: 'alimentacao',
    name: 'Alimentação',
    icon: 'restaurant',
    lastUsedSub: 'supermercado',
    subcategories: [
      { id: 'supermercado', name: 'Supermercado', icon: 'shopping_cart', limitCents: 100000, spentCents: 60300, suggestedAccount: 'va' },
      { id: 'restaurantes', name: 'Restaurantes', icon: 'restaurant', limitCents: 60000, spentCents: 54800, suggestedAccount: 'cartao-panty' },
      { id: 'delivery', name: 'Delivery', icon: 'delivery_dining', limitCents: 30000, spentCents: 36260, suggestedAccount: 'cartao-panty' },
      { id: 'lanches-cafe', name: 'Lanches/Café', icon: 'local_cafe', limitCents: 18000, spentCents: 16700, suggestedAccount: 'cartao-panty' },
    ],
  },
  { id: 'saude', name: 'Saúde', icon: 'favorite' },
  { id: 'educacao', name: 'Educação', icon: 'school' },
  { id: 'cuidados-pessoais', name: 'Cuidados pessoais', icon: 'spa' },
  { id: 'lazer-esporte', name: 'Lazer & Esporte', icon: 'sports_soccer' },
  { id: 'vestuario', name: 'Vestuário', icon: 'checkroom' },
  { id: 'assinaturas', name: 'Assinaturas', icon: 'subscriptions' },
  { id: 'presentes', name: 'Presentes', icon: 'redeem' },
  { id: 'dinheiro-livre', name: 'Dinheiro livre', icon: 'payments' },
  { id: 'financeiro', name: 'Financeiro', icon: 'account_balance' },
  { id: 'futuro', name: 'Futuro', icon: 'savings' },
];

/** As 8 mais usadas, na ordem da grade 4×2. */
export const TOP_CATEGORIES: CategoryId[] = [
  'alimentacao',
  'transporte',
  'saude',
  'lazer-esporte',
  'cuidados-pessoais',
  'dinheiro-livre',
  'presentes',
  'vestuario',
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export function subcategoryById(categoryId: CategoryId, subId: string | undefined) {
  return categoryById(categoryId).subcategories?.find((s) => s.id === subId);
}

/** Despesas variáveis do período, antes desta sessão. */
export const VARIABLE_BUDGET = { spentCents: 231600, limitCents: 409650 };

export interface PendingBill {
  id: string;
  name: string;
  categoryId: CategoryId;
  amountCents: number;
  overdueDays: number;
}

export const PENDING_BILLS: PendingBill[] = [
  { id: 'seguro-carro', name: 'Seguro do carro', categoryId: 'transporte', amountCents: 20100, overdueDays: 4 },
];
